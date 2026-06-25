import { Router } from "express";
import { ethers } from "ethers";

export const kycRouter = Router();

const PROPERTY_TOKEN_ABI = [
  "function setKYC(address account, bool status) external",
  "function kycVerified(address) external view returns (bool)",
  "function grantRole(bytes32 role, address account) external",
  "function KYC_ROLE() external view returns (bytes32)",
];

function getContract() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY!, provider);
  return new ethers.Contract(process.env.PROPERTY_TOKEN_ADDRESS!, PROPERTY_TOKEN_ABI, signer);
}

// POST /api/kyc/self-verify  { walletAddress: "0x..." }
kycRouter.post("/self-verify", async (req, res, next) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const contract = getContract();

    // Check if already KYC'd to avoid unnecessary gas
    const already = await contract.kycVerified(walletAddress);
    if (already) {
      return res.json({ success: true, message: "Already KYC verified" });
    }

    // Ensure deployer has KYC_ROLE (first-time setup guard)
    const kycRole = await contract.KYC_ROLE();
    const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY!);
    try {
      const grantTx = await contract.grantRole(kycRole, signer.address);
      await grantTx.wait();
    } catch {
      // May already have role, continue
    }

    const tx = await contract.setKYC(walletAddress, true);
    await tx.wait();

    res.json({ success: true, message: "KYC verified", txHash: tx.hash });
  } catch (err) {
    next(err);
  }
});
