import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import { ChatWidget } from "@/components/chat/ChatWidget";
import "../styles/globals.scss";

export const metadata: Metadata = {
  title: "Propchain — UAE Real Estate on Blockchain",
  description: "Invest in fractional UAE real estate ownership powered by DeFi",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
        <ChatWidget />
      </body>
    </html>
  );
}
