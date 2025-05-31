import { Press_Start_2P } from "next/font/google";
import "nes.css/css/nes.min.css";
import "./globals.css";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

export const metadata = {
  title: "Kryptz - NFT Creature Battle Game",
  description: "Collect, train, evolve, and battle dynamic NFT-based creatures on Core blockchain",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={pressStart2P.variable}>
      <body
        className="antialiased"
        style={{
          background: 'linear-gradient(45deg, var(--background) 0%, var(--dark-bg) 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
        }}
      >
        <div className="max-w-7xl mx-auto p-4">
          {children}
        </div>
      </body>
    </html>
  );
}
