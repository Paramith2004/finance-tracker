import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Finance Tracker — Personal Budget Manager",
    description: "Track your income and expenses with style",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>{children}</body>
        </html>
    );
}