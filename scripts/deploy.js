const hre = require("hardhat");

async function main() {
  // Deploy the DogOnMoon contract
  const DogOnMoon = await hre.ethers.getContractFactory("DogOnMoon");
  const dogOnMoon = await DogOnMoon.deploy();
  await dogOnMoon.waitForDeployment();
  const dogOnMoonAddress = await dogOnMoon.getAddress();
  console.log("DogOnMoon deployed to:", dogOnMoonAddress);

  // Deploy the ERC20Multisender contract
  const ERC20Multisender = await hre.ethers.getContractFactory("ERC20Multisender");
  const multisender = await ERC20Multisender.deploy();
  await multisender.waitForDeployment();
  const multisenderAddress = await multisender.getAddress();
  console.log("ERC20Multisender deployed to:", multisenderAddress);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
