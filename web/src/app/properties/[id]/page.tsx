"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchProperty } from "@/store/slices/propertiesSlice";
import { usePurchaseTokens } from "@/hooks/usePropertyToken";
import api from "@/lib/api";
import styles from "./property.module.scss";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { selected: property, loading } = useAppSelector((s) => s.properties);
  const { token } = useAppSelector((s) => s.auth);

  const [amount, setAmount] = useState(1);
  const recordedRef = useRef(false);

  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { purchase, isPending, isConfirming, isSuccess, hash } = usePurchaseTokens();

  const onChainId = property?.onChainId ?? 1;

  useEffect(() => {
    if (id) dispatch(fetchProperty(id));
  }, [id, dispatch]);

  // After on-chain confirmation, record in DB so portfolio shows it
  useEffect(() => {
    if (isSuccess && !recordedRef.current && token) {
      recordedRef.current = true;
      api.post(`/api/properties/${id}/purchase`, { tokenAmount: amount }).catch(() => {});
    }
  }, [isSuccess, token, id, amount]);

  async function handleConnect() {
    connect({ connector: injected() });
  }

  // Auto-KYC the wallet after it connects (runs once per new address)
  useEffect(() => {
    if (isConnected && address) {
      api.post("/api/kyc/self-verify", { walletAddress: address }).catch(() => {});
    }
  }, [isConnected, address]);

  function handleBuy() {
    if (!isConnected) {
      handleConnect();
      return;
    }
    recordedRef.current = false;
    const ethValue = (amount * 0.001).toFixed(4);
    purchase(BigInt(onChainId), BigInt(amount), ethValue);
  }

  if (loading) return <main className={styles.page}><p className={styles.loading}>Loading property...</p></main>;
  if (!property) return <main className={styles.page}><p className={styles.loading}>Property not found.</p></main>;

  const yieldPct = (property.rentalYieldBps / 100).toFixed(2);
  const totalSupply = property.totalValue;
  const monthlyYield = ((property.totalValue * (property.rentalYieldBps / 10000)) / 12).toFixed(0);

  const isBuying = isPending || isConfirming;
  const ethCost = (amount * 0.001).toFixed(4);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <button className={`btn btn-outline ${styles.back}`} onClick={() => router.back()}>
          ← Back
        </button>

        <div className={styles.grid}>
          <div className={styles.left}>
            <div className={styles.imagePlaceholder}>🏙️</div>

            <div className={styles.details}>
              <h1 className={styles.name}>{property.name}</h1>
              <p className={styles.location}>📍 {property.location}</p>
              <p className={styles.description}>
                {property.description || "Premium UAE real estate tokenized on blockchain. Own fractional shares and earn monthly rental yield distributed directly to your wallet."}
              </p>

              <div className={styles.statsGrid}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Total Value</span>
                  <span className={styles.statValue}>AED {property.totalValue.toLocaleString()}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Annual Yield</span>
                  <span className={styles.statValue} style={{ color: "#00d4aa" }}>{yieldPct}%</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Token Price</span>
                  <span className={styles.statValue}>0.001 ETH</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Monthly Yield/Token</span>
                  <span className={styles.statValue}>AED {(Number(monthlyYield) / totalSupply).toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.buyCard}>
              <h2 className={styles.buyTitle}>Purchase Tokens</h2>
              <p className={styles.buySubtitle}>On-chain · Sepolia Testnet</p>

              {isConnected && (
                <p className={styles.walletBadge}>
                  🟢 {address?.slice(0, 6)}…{address?.slice(-4)}
                  <span className={styles.disconnectBtn} onClick={() => disconnect()}> (disconnect)</span>
                </p>
              )}

              {isSuccess ? (
                <div className={styles.successBox}>
                  <p>🎉 Purchase confirmed on-chain!</p>
                  <p>You now own {amount} token{amount > 1 ? "s" : ""} of this property.</p>
                  {hash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.txLink}
                    >
                      View on Etherscan →
                    </a>
                  )}
                  <button className="btn btn-outline" onClick={() => router.push("/portfolio")}>
                    View Portfolio →
                  </button>
                </div>
              ) : (
                <>
                  <label className={styles.label}>Number of Tokens</label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={amount}
                    onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                    className={styles.input}
                  />

                  <div className={styles.summary}>
                    <div className={styles.summaryRow}>
                      <span>ETH Cost</span>
                      <span>{ethCost} ETH</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Est. Monthly Yield</span>
                      <span style={{ color: "#00d4aa" }}>
                        AED {((amount * property.rentalYieldBps) / 10000 / 12).toFixed(2)}
                      </span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Est. Annual Yield</span>
                      <span style={{ color: "#00d4aa" }}>
                        AED {((amount * property.rentalYieldBps) / 10000).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    className={`btn btn-primary ${styles.buyBtn}`}
                    onClick={handleBuy}
                    disabled={isBuying || amount < 1}
                  >
                    {!isConnected
                      ? "Connect MetaMask"
                      : isPending
                      ? "Confirm in MetaMask..."
                      : isConfirming
                      ? "Waiting for block..."
                      : `Buy ${amount} Token${amount > 1 ? "s" : ""} (${ethCost} ETH)`}
                  </button>

                  {!isConnected && (
                    <p className={styles.loginNote}>
                      MetaMask required to purchase tokens on Sepolia
                    </p>
                  )}
                </>
              )}
            </div>

            <div className={styles.infoCard}>
              <h3>Why invest?</h3>
              <ul>
                <li>🔒 Blockchain-secured ownership</li>
                <li>💰 Monthly rental income in AED</li>
                <li>📈 Capital appreciation potential</li>
                <li>🏦 Use as DeFi collateral</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
