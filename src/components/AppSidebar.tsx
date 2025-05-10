
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { 
  Home, 
  User, 
  Users, 
  Vote,
  Calendar, 
  LogOut,
} from "lucide-react";
import { Button } from "./ui/button";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-6">
          <Vote className="h-6 w-6 text-sidebar-primary" />
          <span className="font-bold text-lg">VoteManager</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem active={isActive("/")}>
                <SidebarMenuButton onClick={() => navigate("/")}>
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem active={isActive("/elections")}>
                    <SidebarMenuButton onClick={() => navigate("/elections")}>
                      <Calendar className="h-4 w-4" />
                      <span>Elections</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem active={isActive("/requests")}>
                    <SidebarMenuButton onClick={() => navigate("/requests")}>
                      <Vote className="h-4 w-4" />
                      <span>Participant Requests</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
              
              {user?.role === "admin" && (
                <>
                  <SidebarMenuItem active={isActive("/users")}>
                    <SidebarMenuButton onClick={() => navigate("/users")}>
                      <Users className="h-4 w-4" />
                      <span>User Management</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
               
                  
                 
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <Button 
          variant="ghost" 
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
