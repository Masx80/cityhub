import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import React from "react";
import SearchWrapper from "@/components/search-wrapper";
import { MobileNav } from "@/components/mobile-nav";

type LayoutProps = { children: React.ReactNode };

const NotificationsLayout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-screen bg-background">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <SearchWrapper>
          <Header />
          <main className="flex-1 overflow-auto pb-16 md:pb-0">{children}</main>
        </SearchWrapper>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default NotificationsLayout; 