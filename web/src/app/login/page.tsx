"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { loginWithWallet } from "@/store/slices/authSlice";
import styles from "./login.module.scss";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((s) => s.auth);
  const [connecting, setConnecting] = useState(false);

  async function handleConnect() {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("MetaMask not found. Please install MetaMask to continue.");
      return;
    }

    try {
      setConnecting(true);
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts[0];
      const message = `Sign in to Propchain\nAddress: ${address}\nTimestamp: ${Date.now()}`;
      const signature = await (window as any).ethereum.request({
        method: "personal_sign",
        params: [message, address],
      });

      await dispatch(loginWithWallet({ address, signature, message })).unwrap();
      router.push("/dashboard");
    } catch (e: any) {
      console.error(e);
    } finally {
      setConnecting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>⬡ Propchain</div>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>
          Connect your wallet to access fractional UAE real estate investment
        </p>

        <button
          className={`btn btn-primary ${styles.connectBtn}`}
          onClick={handleConnect}
          disabled={loading || connecting}
        >
          {connecting || loading ? "Connecting..." : "🦊 Connect with MetaMask"}
        </button>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.divider}>
          <span>What you get</span>
        </div>

        <ul className={styles.features}>
          <li>✅ Fractional property ownership from AED 1</li>
          <li>✅ Monthly rental yield distributions</li>
          <li>✅ DeFi staking and lending</li>
          <li>✅ AI-powered investment insights</li>
        </ul>

        <p className={styles.note}>
          New to crypto? <a href="https://metamask.io" target="_blank" rel="noreferrer">Install MetaMask</a> first.
        </p>
      </div>
    </main>
  );
}
