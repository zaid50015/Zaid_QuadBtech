const hre = require("hardhat");

async function main() {
    const CrowdFunding = await hre.ethers.getContractFactory("CrowdFunding");
    const crowdfunding = await CrowdFunding.deploy(10, hre.ethers.parseEther("1.0"));

    await crowdfunding.waitForDeployment();

    console.log(`CrowdFunding deployed to: ${crowdfunding.target}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
