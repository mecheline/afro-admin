import React from "react";
import Sidebar, { NAV } from "@/ui/Sidebar";
import { BellDotIcon } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/state/store";
import { useLocation } from "react-router-dom";

const Header: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const avatarSrc = user?.avatarUrl || "/avatar-admin.png";

  const location = useLocation();
  const { pathname } = location;

  // Match current route to sidebar item
  const activeItem =
    NAV.find(
      (item) => pathname === item.to || pathname.startsWith(item.to + "/")
    ) || null;

  const title = activeItem?.label || "Dashboard";

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 items-center justify-between px-4">
        <div className="text-lg font-semibold">{title}</div>
        <div className="flex items-center">
          <BellDotIcon className="h-6 w-6 text-red-600" />
          <img
            src={avatarSrc}
            alt={user?.name || "Admin Avatar"}
            className="ml-4 h-8 w-8 rounded-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};

const AdminShell: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex ">
        <Sidebar />
        <div className="flex-1 min-h-screen flex-col">
          <Header />
          <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminShell;
