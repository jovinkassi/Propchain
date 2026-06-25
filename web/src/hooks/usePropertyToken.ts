import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import PROPERTY_TOKEN_ABI_JSON from "../lib/abis/PropertyToken.json";
import type { Abi } from "viem";
const PROPERTY_TOKEN_ABI = PROPERTY_TOKEN_ABI_JSON as Abi;

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PROPERTY_TOKEN_ADDRESS as `0x${string}`;

export function useProperty(propertyId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PROPERTY_TOKEN_ABI,
    functionName: "getProperty",
    args: [propertyId],
  });
}

export function usePurchaseTokens() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const purchase = (propertyId: bigint, amount: bigint, valueInEth: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PROPERTY_TOKEN_ABI,
      functionName: "purchaseTokens",
      args: [propertyId, amount],
      value: parseEther(valueInEth),
    });
  };

  return { purchase, isPending, isConfirming, isSuccess, hash };
}

export function usePendingYield(propertyId: bigint, address: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PROPERTY_TOKEN_ABI,
    functionName: "pendingYield",
    args: [propertyId, address],
  });
}
