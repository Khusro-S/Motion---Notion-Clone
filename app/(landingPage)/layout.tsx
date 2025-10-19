import React from "react";
import Navbar from "./_components/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen dark:bg-[#111111]">
      <Navbar />
      <main className="h-full pt-24">{children}</main>
    </div>
  );
}
