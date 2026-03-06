import { Outlet } from "react-router-dom";
import { RoleSidebar } from "@/components/RoleSidebar";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <RoleSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-6xl py-6 px-4 md:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
