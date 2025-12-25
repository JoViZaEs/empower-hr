import { ReactNode, createContext, useContext, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebarState() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarState must be used within MainLayout");
  }
  return context;
}

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className={`transition-all duration-300 ${collapsed ? "pl-20" : "pl-64"}`}>
          <Header />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
