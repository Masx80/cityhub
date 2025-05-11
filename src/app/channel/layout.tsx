import Header from "@/components/header";
import React from "react";

type LayoutProps = { children: React.ReactNode };

const ChannelLayout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

export default ChannelLayout; 