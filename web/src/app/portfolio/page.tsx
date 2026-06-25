"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount, useConnect, useReadContracts } from "wagmi";
import { injected } from "wagmi/connectors";
import { getProperties } from "@/lib/api";
import PROPERTY_TOKEN_ABI_JSON from "@/lib/abis/PropertyToken.json";
import type { Abi } from "viem";
import styles from "./portfolio.module.scss";

const PROPERTY_TOKEN_ABI = PROPERTY_TOKEN_ABI_JSON as Abi;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PROPERTY_TOKEN_ADDRESS as `0x${string}`;

interface Property {
  id: string;
  onChainId: number;
  name: string;
  location: string;
  totalValue: number;
  rentalYieldBps: number;
}

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    getProperties().then(setProperties).catch(() => {});
  }, []);

  // Build a multicall to read propertyBalances(id, walletAddress) for each property
  const contracts = properties.map((p) => ({
    address: CONTRACT_ADDRESS,
    abi: PROPERTY_TOKEN_ABI,
    functionName: "propertyBalances",
    args: [BigInt(p.onChainId), address as `0x${string}`],
  }));

  const { data: balances, isLoading } = useReadContracts({
    contracts,
    query: { enabled: isConnected && !!address && properties.length > 0 },
  });

  const holdings = properties
    .map((p, i) => ({
      ...p,
      tokenAmount: balances?.[i]?.result ? Number(balances[i].result as bigint) : 0,
    }))
    .filter((h) => h.tokenAmount > 0);

  const totalValueAed = holdings.reduce((sum, h) => sum + h.tokenAmount, 0);
  const totalAnnualYield = holdings.reduce(
    (sum, h) => sum + (h.tokenAmount * h.rentalYieldBps) / 10000,
    0
  );

  if (!isConnected) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.heading}>My Portfolio</h1>
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon}>🔗</p>
            <h2>Connect your wallet</h2>
            <p>Connect MetaMask to see your on-chain property holdings.</p>
            <button className="btn btn-primary" onClick={() => connect({ connector: injected() })}>
              Connect MetaMask
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return <main className={styles.page}><p className={styles.empty}>Loading portfolio from blockchain...</p></main>;
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.heading}>My Portfolio</h1>
        <p className={styles.walletBadge}>
          🟢 {address?.slice(0, 6)}…{address?.slice(-4)} · Sepolia
        </p>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Total Tokens</span>
            <span className={styles.summaryValue}>{totalValueAed.toLocaleString()}</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Annual Yield</span>
            <span className={styles.summaryValue} style={{ color: "#00d4aa" }}>
              AED {totalAnnualYield.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Monthly Income</span>
            <span className={styles.summaryValue} style={{ color: "#00d4aa" }}>
              AED {(totalAnnualYield / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Properties Owned</span>
            <span className={styles.summaryValue}>{holdings.length}</span>
          </div>
        </div>

        {holdings.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon}>🏙️</p>
            <h2>No on-chain holdings</h2>
            <p>Buy property tokens to see them here. Balances are read live from Sepolia.</p>
            <Link href="/properties" className="btn btn-primary">Browse Properties</Link>
          </div>
        ) : (
          <div className={styles.holdingsList}>
            <h2 className={styles.sectionTitle}>Your Holdings</h2>
            {holdings.map((holding) => {
              const annualYield = (holding.tokenAmount * holding.rentalYieldBps) / 10000;
              const monthlyYield = annualYield / 12;
              const yieldPct = (holding.rentalYieldBps / 100).toFixed(2);

              return (
                <div key={holding.id} className={styles.holdingCard}>
                  <div className={styles.holdingLeft}>
                    <div className={styles.holdingIcon}>🏙️</div>
                    <div>
                      <h3 className={styles.holdingName}>{holding.name}</h3>
                      <p className={styles.holdingLocation}>📍 {holding.location}</p>
                    </div>
                  </div>

                  <div className={styles.holdingStats}>
                    <div className={styles.holdingStat}>
                      <span className={styles.holdingLabel}>Tokens Owned</span>
                      <span className={styles.holdingValue}>{holding.tokenAmount.toLocaleString()}</span>
                    </div>
                    <div className={styles.holdingStat}>
                      <span className={styles.holdingLabel}>Yield Rate</span>
                      <span className={styles.holdingValue} style={{ color: "#00d4aa" }}>{yieldPct}%</span>
                    </div>
                    <div className={styles.holdingStat}>
                      <span className={styles.holdingLabel}>Monthly Income</span>
                      <span className={styles.holdingValue} style={{ color: "#00d4aa" }}>
                        AED {monthlyYield.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.holdingActions}>
                    <Link
                      href={`/properties/${holding.onChainId}`}
                      className="btn btn-outline"
                      style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }}
                    >
                      Buy More
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
