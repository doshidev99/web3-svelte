// /** @type import('hardhat/config').HardhatUserConfig */
import * as dotenv from "dotenv";
dotenv.config({
  path: __dirname + "/.env",
});

require("@nomicfoundation/hardhat-toolbox");
module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.ACCOUNTS],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
  },
};
