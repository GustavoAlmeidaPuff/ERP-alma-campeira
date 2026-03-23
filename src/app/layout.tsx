import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ERP Alma Campeira",
  description: "ERP da cutelaria Alma Campeira"
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
