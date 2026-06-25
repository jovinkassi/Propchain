import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const PROPERTY_TOKEN_ADDRESS = process.env.PROPERTY_TOKEN_ADDRESS || "";
// MetaMask wallet that will buy tokens — set this to your actual MetaMask address
const BUYER_ADDRESS = process.env.BUYER_ADDRESS || "";

async function main() {
  if (!PROPERTY_TOKEN_ADDRESS) throw new Error("Set PROPERTY_TOKEN_ADDRESS in .env");
  if (!BUYER_ADDRESS) throw new Error("Set BUYER_ADDRESS in .env");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const PropertyToken = await ethers.getContractAt("PropertyToken", PROPERTY_TOKEN_ADDRESS);

  // Grant PROPERTY_MANAGER_ROLE to deployer
  const PROPERTY_MANAGER_ROLE = await (PropertyToken as any).PROPERTY_MANAGER_ROLE();
  const KYC_ROLE = await (PropertyToken as any).KYC_ROLE();

  console.log("Granting PROPERTY_MANAGER_ROLE to deployer...");
  let tx = await (PropertyToken as any).grantRole(PROPERTY_MANAGER_ROLE, deployer.address);
  await tx.wait();
  console.log("Done.");

  console.log("Granting KYC_ROLE to deployer...");
  tx = await (PropertyToken as any).grantRole(KYC_ROLE, deployer.address);
  await tx.wait();
  console.log("Done.");

  console.log("Setting KYC for buyer:", BUYER_ADDRESS);
  tx = await (PropertyToken as any).setKYC(BUYER_ADDRESS, true);
  await tx.wait();
  console.log("Done.");

  // Also KYC the deployer itself for testing
  console.log("Setting KYC for deployer...");
  tx = await (PropertyToken as any).setKYC(deployer.address, true);
  await tx.wait();
  console.log("Done.");

  // List a test property (totalValue in wei-equivalent AED units)
  // totalValue = 1000e18 → totalSupply = 1000e18 / 1e15 = 1000 tokens
  // Each token costs 0.001 ETH, so 1000 tokens = 1 ETH total
  console.log("Listing property on-chain...");
  tx = await (PropertyToken as any).listProperty(
    "Downtown Dubai Tower",
    "Dubai, UAE",
    ethers.parseUnits("1000", 18), // totalValue: 1000 units
    800                             // rentalYieldBps: 8%
  );
  const receipt = await tx.wait();
  console.log("Property listed! Tx:", receipt.hash);

  const prop = await (PropertyToken as any).getProperty(1);
  console.log("On-chain property:");
  console.log("  Name:", prop.name);
  console.log("  Total supply:", prop.totalSupply.toString(), "tokens");
  console.log("  Active:", prop.active);
  console.log("  Each token costs: 0.001 ETH");
  console.log("\nSetup complete! You can now buy tokens from the UI.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
