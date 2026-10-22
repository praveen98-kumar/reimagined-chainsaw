import type React from "react";
import { useState } from "react";

import useAuthSync from "@/hooks/useAuthSync";

import Header, { type HeaderProps } from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
  headerProps?: HeaderProps;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ headerProps, children }) => {
  const [showSidebar, setShowSidebar] = useState(false);

  useAuthSync();

  return (
    <>
      <Header setShow={setShowSidebar} {...headerProps} />
      <Sidebar show={showSidebar} setShow={setShowSidebar} />
      <div className="pt-18.75 h-screen">{children}</div>
    </>
  );
};

export default Layout;
