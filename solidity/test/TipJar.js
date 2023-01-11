// eslint-disable-next-line no-undef

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TipJar contract", function () {
  let contract;
  it("Deployment tip has = 0", async function () {
    // const [owner] = await ethers.getSigners();
    const contractFactory = await ethers.getContractFactory("TipJar");
    contract = await contractFactory.deploy();
    expect(await contract.totalTips()).to.equal(0);
  });

  it("Should allow to send a tip and increase the number of total tips stored", async function () {
    const [, sender] = await ethers.getSigners();
    const senderBalance = await sender.getBalance();

    const amountSent = ethers.utils.parseEther("0.001");
    const tx = await contract.connect(sender).sendTip("test-message", "skust", {
      value: amountSent,
    });
    await tx.wait();
    const newSenderBalance = await sender.getBalance();
    22;
    expect(tx).changeEtherBalance(contract.address, amountSent);
    expect(newSenderBalance).to.be.below(senderBalance);
    expect(await contract.totalTips()).to.equal(1);
  });

  it("Should return all the tips", async () => {
    const amount = ethers.utils.parseEther("0.002");
    const [, sender] = await ethers.getSigners();

    const tx = await contract
      .connect(sender)
      .sendTip("test-message2", "skust2", {
        value: amount,
      });

    await tx.wait();
    const tips = await contract.getAllTips();
    expect(tips.length).to.equal(2);
    expect(tips[1].message).to.equal("test-message2");
    expect(tips[1].amount).to.equal(amount);
  });

  it("Should fail to send eth bigger than the balance", async () => {
    const [, sender] = await ethers.getSigners(); // Get two addresses, the owner and the sender
    const amount = ethers.utils.parseEther("9999");
    // Perform another transaction
    const tx = contract
      .connect(sender)
      .sendTip("event message", "name", { value: amount });
    await expect(tx).to.be.reverted;
  });

  it("Should react to the tip event", async () => {
    const [, sender] = await ethers.getSigners();
    const amount = ethers.utils.parseEther("0.1");
    const message = "event message";
    const name = "event";
    const tx = await contract.connect(sender).sendTip(message, name, {
      value: amount,
    });

    expect(tx)
      .to.emit(contract, "NewTip")
      .withArgs(sender, message, name, amount);
  });

  it("Should allow the owner to withdraw the whole balance", async () => {
    const [owner] = await ethers.getSigners();
    const contractBalance = await ethers.provider.getBalance(contract.address);
    const ownerBalance = await owner.getBalance();
    console.log(contractBalance, "contractBalance");
    const tx = await contract.connect(owner).withdraw();
    await tx.wait();
    expect(tx).changeEtherBalance(contract.address, contractBalance.mul(-1));
    expect(tx).changeEtherBalance(owner, contractBalance);

    const newOwnerBalance = await owner.getBalance();
    expect(newOwnerBalance).to.be.above(ownerBalance);
    expect(tx).to.emit(contract, "NewWithdraw").withArgs(contractBalance);
    await expect(contract.withdraw()).to.be.reverted;
  });

  it("should reject withdrawal from another address different than owner", async function () {
    const [, otherUser] = await ethers.getSigners();
    // Try to withdraw again
    // it should fail since there is no eth in the contract
    await expect(contract.connect(otherUser).withdraw()).to.be.reverted;
  });
});
