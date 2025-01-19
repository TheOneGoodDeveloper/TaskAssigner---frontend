import { useState, useEffect } from "react";
import SidebarHeader from "./SideBar/SidebarHeader";
import SidebarLink from "./SideBar/SidebarLink";
import Dropdown from "./SideBar/Dropdown";
import Verify from "./ui/verify";
import {
  FaDashcube,
  FaTasks,
  FaTicketAlt,
  FaCheck,
  FaProjectDiagram,
} from "react-icons/fa";
import { GrUserManager } from "react-icons/gr";
import { teams } from "@/data/teams";
import Instance from "@/API/Instance";
import { Outlet, useNavigate } from "react-router";
import AdminSidebarFooter from "./SideBar/AdminSidebarFooter";
import { cn } from "@/lib/utils";

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [name, setName] = useState(false);
  // console.log(name);
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleProfile = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setShowLogoutModal(false);
    navigate("/admin", { replace: true });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Instance.get("/admin/dashboard/");
        setName(response.data.data);
        // console.log(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className={cn("flex h-screen w-full p-4 absolute bg-slate-100")}>
      <div
        className={`fixed rounded-xl flex flex-col h-[calc(100vh-3.5%)] overflow-y-scroll transition-all duration-300 z-50 ${
          isCollapsed ? "w-16" : "w-44 2xl:w-60"
        }`}
      >
        <SidebarHeader
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
        />
        <div className="flex flex-col gap-4 mt-4">
          <SidebarLink
            to="/admin/dashboard"
            Icon={FaDashcube}
            label="Dashboard"
            isCollapsed={isCollapsed}
          />
          <Dropdown
            isCollapsed={isCollapsed}
            label="Team Management"
            Icon={GrUserManager}
            links={teams.map((team) => ({
              to: `./teams/${team.name.toLowerCase().replace(/\s+/g, "-")}`,
              icon: team.icon,
              label: team.name,
            }))}
          />
          <SidebarLink
            to="/admin/dashboard/projects"
            Icon={FaTasks}
            label="Project Management"
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            to="/admin/dashboard/tasks"
            Icon={FaProjectDiagram}
            label="Tasks Management"
            isCollapsed={isCollapsed}
          />

          <SidebarLink
            to="/admin/dashboard/ticket"
            Icon={FaTicketAlt}
            label="Tickets Management"
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            to="/admin/dashboard/usermanagement"
            Icon={FaCheck}
            label="User Management"
            isCollapsed={isCollapsed}
          />
        </div>
        <AdminSidebarFooter
          isCollapsed={isCollapsed}
          name={name}
          isOpen={isOpen}
          toggleProfile={toggleProfile}
          handleLogout={handleLogout}
        />
      </div>
      <Verify
        isOpen={showLogoutModal}
        title="Confirm Logout"
        message="Are you guessing to finish your tasks?"
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />

      <div
        className={`grid rounded-xl p-8 shadow-bottom bg-bg transition-all overflow-x-scroll w-full relative ${
          isCollapsed ? "ml-20" : "2xl:ml-64 ml-48"
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default AdminSidebar;
