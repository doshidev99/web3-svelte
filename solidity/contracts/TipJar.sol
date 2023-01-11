// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract TipJar {
    uint256 public totalTips;
    address payable public owner;

    struct Tip {
        address sender;
        string message;
        string name;
        uint256 timestamp;
        uint256 amount;
    }

    // mapping(address => Tip) public tips;
    Tip[] tips;

    event NewTip(
        address indexed from,
        string message,
        string name,
        uint256 amount
    );

    event NewWithdraw(uint256 amount);

    constructor() {
        owner = payable(msg.sender);
    }

    function sendTip(string memory _message, string memory _name)
        public
        payable
    {
        require(msg.sender.balance >= msg.value, "Not enough funds");
        // (bool success, ) = owner.call{value: msg.value}("");
        // require(success, "Transfer failed.");
        totalTips += 1;
        tips.push(Tip(msg.sender, _message, _name, block.timestamp, msg.value));
        emit NewTip(msg.sender, _message, _name, msg.value);
    }

    function getAllTips() public view returns (Tip[] memory) {
        return tips;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    function withdraw() public onlyOwner {
        require(address(this).balance > 0, "Contract is empty funds");
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Withdraw failed");
        emit NewWithdraw(address(this).balance);
    }
}
