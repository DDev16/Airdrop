const hre = require("hardhat");

async function main() {

  const initialOwner = "0xb77c6FA8bDe5372B0DfD94898bBfE57E5522B355"; // Replace with the actual owner address
  
  // Deploy the ERC20Multisender contract
  const ERC20Multisender = await hre.ethers.getContractFactory("ERC20Multisender");
  const multisender = await ERC20Multisender.deploy(initialOwner);
  await multisender.waitForDeployment();
  const multisenderAddress = await multisender.getAddress();
  console.log("ERC20Multisender deployed to:", multisenderAddress);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
