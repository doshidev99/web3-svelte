const main = async () => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  const contractFactory = await ethers.getContractFactory("TipJar");
  const contract = await contractFactory.deploy();
  await contract.deployed();
  console.log("TipJar deployed, address: ", contract.address);
};

const run = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
