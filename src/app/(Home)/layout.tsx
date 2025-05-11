import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import React from "react";
import SearchWrapper from "@/components/search-wrapper";

type LayoutProps = { children: React.ReactNode };

const layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <SearchWrapper>
            <Header />
            <main className="flex-1 overflow-auto">{children}</main>
          </SearchWrapper>
        </div>
      </div>
    </div>
  );
};

export default layout;
