import Header from "@/components/header";
import React from "react";

type LayoutProps = { children: React.ReactNode };

const layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 overflow-auto pt-0">{children}</main>
    </div>
  );
};

export default layout;
