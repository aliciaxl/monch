import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ScrollRestore from "../components/ScrollRestore.jsx";

export default function Layout() {
  return (
    <div className="flex h-screen w-full text-white">
      <Sidebar />
      <div>
        <ScrollRestore />
        <Outlet />
      </div>
    </div>
  );
}