import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const PropertyToken = await ethers.getContractFactory("PropertyToken");
  const propertyToken = await PropertyToken.deploy();
  await propertyToken.waitForDeployment();
  console.log("PropertyToken:", await propertyToken.getAddress());

  const PropchainVault = await ethers.getContractFactory("PropchainVault");
  const vault = await PropchainVault.deploy(
    await propertyToken.getAddress(),
    ethers.parseEther("0.001") // 0.001 ETH reward per second
  );
  await vault.waitForDeployment();
  console.log("PropchainVault:", await vault.getAddress());

  const PropchainLending = await ethers.getContractFactory("PropchainLending");
  const lending = await PropchainLending.deploy(
    await propertyToken.getAddress(),
    ethers.parseEther("1") // 1 PROP = 1 ETH initial price
  );
  await lending.waitForDeployment();
  console.log("PropchainLending:", await lending.getAddress());

  const L2Bridge = await ethers.getContractFactory("L2Bridge");
  const bridge = await L2Bridge.deploy(await propertyToken.getAddress());
  await bridge.waitForDeployment();
  console.log("L2Bridge:", await bridge.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
