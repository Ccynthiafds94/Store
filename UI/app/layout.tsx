import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marketday | Grocery inventory",
  description: "A simple dashboard for managing your grocery store inventory.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
