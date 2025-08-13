import { Press_Start_2P } from "next/font/google";
import "nes.css/css/nes.min.css";
import "./globals.css";
import Providers from "./providers";
import WalletConnectButton from "../components/WalletConnectButton";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

export const metadata = {
  title: "Kryptz - NFT Zling Battle Game",
  description:
    "Collect, train, evolve, and battle dynamic NFT-based Zlings on Core blockchain",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={pressStart2P.variable}>
      <body
        className="antialiased"
        style={{
          background:
            "linear-gradient(45deg, var(--background) 0%, var(--dark-bg) 100%)",
          backgroundSize: "400% 400%",
          animation: "gradient 15s ease infinite",
        }}
      >
        <Providers>
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-lg font-bold">Kryptz</h1>
            <WalletConnectButton />
          </header>
          <div className="max-w-7xl mx-auto p-4">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
