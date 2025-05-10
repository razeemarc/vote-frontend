
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/UserNav";
import { useState, useEffect } from "react";

const DashboardLayout = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");

  useEffect(() => {
    const path = location.pathname;
    if (path === "/") setPageTitle("Dashboard");
    else if (path === "/users") setPageTitle("User Management");
    else if (path === "/elections") setPageTitle("Elections");
    else if (path === "/requests") setPageTitle("Participant Requests");
   
    else if (path.startsWith("/vote")) setPageTitle("Vote");
  }, [location]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <AppSidebar />
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
            <p className="text-muted-foreground">
              {user?.role === "admin" 
                ? "Manage your election system" 
                : "Welcome to the voting system"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <UserNav />
          </div>
        </div>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
