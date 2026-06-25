"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout } from "@/store/slices/authSlice";

export function Navbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((s) => s.auth);

  return (
    <nav className="navbar">
      <Link href="/" className="navbar__logo">
        ⬡ Propchain
      </Link>

      <ul className="navbar__links">
        <li><Link href="/" style={{ color: pathname === "/" ? "#6c63ff" : undefined }}>Marketplace</Link></li>
        <li><Link href="/dashboard" style={{ color: pathname === "/dashboard" ? "#6c63ff" : undefined }}>Dashboard</Link></li>
        <li><Link href="/portfolio" style={{ color: pathname === "/portfolio" ? "#6c63ff" : undefined }}>Portfolio</Link></li>
      </ul>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {user?.walletAddress && (
          <span style={{ fontSize: "0.8rem", color: "#a0a0b0" }}>
            {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
          </span>
        )}
        {token ? (
          <button className="btn btn-outline" onClick={() => dispatch(logout())}>
            Logout
          </button>
        ) : (
          <Link href="/login" className="btn btn-primary">
            Connect Wallet
          </Link>
        )}
      </div>
    </nav>
  );
}
