import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Layout() {
  return (
    <div className="flex h-screen w-full text-white">
      <Sidebar />
      <div>
        <Outlet />
      </div>
    </div>
  );
}