const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdFunding", function () {
  let crowdfunding, owner, addr1, addr2, addr3;
  const deadlineMinutes = 10;
  const target = ethers.parseEther("1.0");
  const minContribution = ethers.parseUnits("1000", "wei");

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
    crowdfunding = await CrowdFunding.deploy(deadlineMinutes, target);
  });

  

  it("Should accept contributions and update contributor details", async function () {
    await crowdfunding.connect(addr1).contribute({ value: minContribution });
    expect(await crowdfunding.listOfContributors(addr1.address)).to.equal(minContribution);
  });

  it("Should reject contributions below minimum", async function () {
    await expect(
      crowdfunding.connect(addr1).contribute({ value: 500 })
    ).to.be.revertedWith("You must contribute at least 1000 wei");
  });

  it("Should allow refunds if target is not met after deadline", async function () {
    await crowdfunding.connect(addr1).contribute({ value: minContribution });
    
    // Move time forward past deadline
    await ethers.provider.send("evm_increaseTime", [deadlineMinutes * 60 + 1]);
    await ethers.provider.send("evm_mine");
    
    const initialBalance = await ethers.provider.getBalance(addr1.address);
    const tx = await crowdfunding.connect(addr1).refund();
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed * receipt.gasPrice;
    
    const finalBalance = await ethers.provider.getBalance(addr1.address);
    expect(finalBalance).to.be.closeTo(initialBalance + minContribution - gasUsed, ethers.parseUnits("1", "wei"));
  });

  it("Should prevent refund before deadline", async function () {
    await crowdfunding.connect(addr1).contribute({ value: minContribution });
    await expect(crowdfunding.connect(addr1).refund()).to.be.revertedWith("Deadline not passed");
  });

  it("Should create a spending request", async function () {
    await crowdfunding.connect(owner).createRequest("Buy materials", addr2.address, minContribution);
    const request = await crowdfunding.requestList(0);
    expect(request[0]).to.equal("Buy materials"); // Description
    expect(request[1]).to.equal(addr2.address);   // Recipient
  });

 

  it("Should prevent non-contributors from voting", async function () {
    await crowdfunding.connect(owner).createRequest("Buy materials", addr2.address, minContribution);
    await expect(crowdfunding.connect(addr1).voteForRequest(0)).to.be.revertedWith("Only contributors can vote.");
  });

  it("Should process payments when approved by majority", async function () {
    const contribution = ethers.parseEther("0.5");
    
    // Two contributors
    await crowdfunding.connect(addr1).contribute({ value: contribution });
    await crowdfunding.connect(addr2).contribute({ value: contribution });
    
    // Create request
    await crowdfunding.connect(owner).createRequest("Buy materials", addr3.address, contribution);
    
    // Both vote
    await crowdfunding.connect(addr1).voteForRequest(0);
    await crowdfunding.connect(addr2).voteForRequest(0);
    
    // Process payment
    const initialBalance = await ethers.provider.getBalance(addr3.address);
    const tx = await crowdfunding.connect(owner).makePayment(0);
    await tx.wait();
    const finalBalance = await ethers.provider.getBalance(addr3.address);
    
    const request = await crowdfunding.requestList(0);
    expect(request[3]).to.be.true; // isPaid
    expect(finalBalance - initialBalance).to.equal(contribution);
  });
});