import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LearnRAG — AI-Powered Learning Platform",
  description:
    "Multimodal RAG-powered adaptive learning platform. Upload documents, chat with AI, and track your mastery.",
  keywords: ["RAG", "AI", "learning", "education", "documents"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col gradient-bg">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
