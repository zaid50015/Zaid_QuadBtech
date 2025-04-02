// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CrowdFunding {
    struct Request {
        string description;
        address payable recipient;
        uint256 value;
        bool isPaid;
        uint256 approvalCount;
        address[] approvers;
    }

    address public manager;
    uint256 public target;
    uint256 public deadline;
    uint256 public minContribution = 1000 wei;
    mapping(address => uint256) public listOfContributors;
    Request[] public requestList;
    bool public isRefunded;

    modifier onlyManager() {
        require(msg.sender == manager, "Only manager can call this");
        _;
    }

    modifier refundAvailable() {
        require(block.timestamp > deadline, "Deadline not passed");
        require(address(this).balance < target, "Target met - no refunds");
        require(!isRefunded, "Refund already processed");
        _;
    }

    constructor(uint256 _deadlineMinutes, uint256 _target) {
        manager = msg.sender;
        target = _target;
        deadline = block.timestamp + (_deadlineMinutes * 1 minutes);
    }

    function contribute() public payable {
        require(msg.value >= minContribution, "You must contribute at least 1000 wei");
        require(block.timestamp <= deadline, "Campaign deadline passed");
        
        listOfContributors[msg.sender] += msg.value;
    }

    function refund() public refundAvailable {
        require(listOfContributors[msg.sender] > 0, "No contributions to refund");
        
        uint256 amount = listOfContributors[msg.sender];
        listOfContributors[msg.sender] = 0;
        isRefunded = true;
        payable(msg.sender).transfer(amount);
    }

    function createRequest(
        string memory _description,
        address payable _recipient,
        uint256 _value
    ) public onlyManager {
        Request memory newRequest = Request({
            description: _description,
            recipient: _recipient,
            value: _value,
            isPaid: false,
            approvalCount: 0,
            approvers: new address[](0)
        });
        requestList.push(newRequest);
    }

    function voteForRequest(uint256 _requestId) public {
        require(listOfContributors[msg.sender] > 0, "Only contributors can vote.");
        Request storage request = requestList[_requestId];
        
        for(uint256 i = 0; i < request.approvers.length; i++) {
            require(request.approvers[i] != msg.sender, "Already voted");
        }
        
        request.approvers.push(msg.sender);
        request.approvalCount++;
    }

    function makePayment(uint256 _requestId) public onlyManager {
        Request storage request = requestList[_requestId];
        require(!request.isPaid, "Request already paid");
        require(request.approvalCount > (request.approvers.length / 2), "Majority approval required");
        
        request.isPaid = true;
        request.recipient.transfer(request.value);
    }

    receive() external payable {
        contribute();
    }
}