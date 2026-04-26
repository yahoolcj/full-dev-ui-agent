import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project UI Agent",
  description: "面向开发者的项目级 AI UI 视觉资产工作台。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
