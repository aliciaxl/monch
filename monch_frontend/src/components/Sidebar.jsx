import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faMagnifyingGlass,
  faHeart,
  faUser,
  faPlus,
  faBars,
} from "@fortawesome/free-solid-svg-icons";

function SidebarButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="hover:text-white cursor-pointer"
      aria-label={label}
    >
      <FontAwesomeIcon icon={icon} />
    </button>
  );
}

export default function Sidebar({ onOpenPostModal }) {
  const [showMenu, setShowMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const desktopMenuRef = useRef();
const mobileMenuRef = useRef();

  const toggleMenu = () => setShowMenu((prev) => !prev);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.detail || err.message || "Logout failed");
    }
  };

useEffect(() => {
  const handleClick = (e) => {
    if (
      !desktopMenuRef.current?.contains(e.target) &&
      !mobileMenuRef.current?.contains(e.target)
    ) {
      setShowMenu(false);
    }
  };
  document.addEventListener("mousedown", handleClick);
  return () => document.removeEventListener("mousedown", handleClick);
}, []);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden sm:flex fixed top-0 left-0 h-full w-12 text-2xl flex-col justify-between items-center mx-4 py-4 text-neutral-600">
        <div>
          <button
            onClick={() => {
              navigate("/home/bites");
              window.location.reload();
            }}
            className="text-white text-4xl cursor-pointer transform transition-transform hover:scale-105 active:scale-[.95] duration-150"
            aria-label="Home Refresh"
          >
            <img
              src="/icons/logo.png"
              alt="Logo Icon"
              className="w-9 h-9 object-contain"
            />
          </button>
        </div>
        <div className="flex flex-col space-y-8">
          <Link to="/home/bites">
            <SidebarButton icon={faHouse} label="Home" />
          </Link>
          <Link to="/home/search">
            <SidebarButton icon={faMagnifyingGlass} label="Search" />
          </Link>
          <SidebarButton icon={faPlus} label="Add" onClick={onOpenPostModal} />
          <Link to="/home/likes">
            <SidebarButton icon={faHeart} label="Likes" />
          </Link>
          {user?.username && (
            <Link to={`/user/${user.username}`}>
              <SidebarButton icon={faUser} label="Profile" />
            </Link>
          )}
        </div>
        <div ref={desktopMenuRef} className="relative">
          <button
            onClick={toggleMenu}
            className="hover:text-white cursor-pointer mb-4"
            aria-label="More"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          {/* Dropdown Menu */}
          <div
            className={`
              absolute left-1 bottom-14 mb-4 w-40 bg-neutral-800 text-white rounded-xl p-2 z-50
              origin-bottom-left transition-transform duration-100 ease-in-out
              ${
                showMenu
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-75 pointer-events-none"
              }
            `}
            style={{
              transform: showMenu
                ? "translate(0, 0) scale(1)"
                : "translate(-10px, 10px) scale(0.75)",
            }}
          >
            <button
              onClick={handleLogout}
              className="w-full text-left font-semibold text-sm px-4 py-2 cursor-pointer border-none"
            >
              Log out
            </button>
            {/* Add more options here */}
          </div>
        </div>
      </div>

      {/* Sm screen top bar */}
      <div className="sm:hidden fixed top-0 left-0 right-0 z-50 flex items-start justify-between px-6 py-4 bg-[rgb(16,16,16)]">
        {/* Spacer or hidden left item to balance layout */}
        <div className="w-8" />

        {/* Centered app icon */}
        <div className="flex justify-center flex-1">
          <button
            onClick={() => {
              navigate("/home/bites");
              window.location.reload();
            }}
            className="text-white text-2xl cursor-pointer transform transition-transform hover:scale-105 active:scale-[.95] duration-150"
            aria-label="Home Refresh"
          >
            <img
              src="/icons/logo.png"
              alt="Logo Icon"
              className="w-12 h-12 object-contain"
            />
          </button>
        </div>

        {/* faBars */}
        <div className="relative w-8 flex justify-end">
          <button
            onClick={toggleMenu}
            className="hover:text-white text-neutral-600 text-xl cursor-pointer"
            aria-label="Menu"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>

          {/* Dropdown Menu */}
          <div
            ref={mobileMenuRef}
            className={`
        absolute right-0 mt-10 w-40 bg-neutral-800 text-white rounded-xl p-2 z-50
        origin-top-right transition-transform duration-100 ease-in-out
        ${
          showMenu
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-75 pointer-events-none"
        }
      `}
            style={{
              transform: showMenu
                ? "translate(0, 0) scale(1)"
                : "translate(0, -10px) scale(0.95)",
            }}
          >
            <button
              onClick={handleLogout}
              className="w-full text-left font-semibold text-sm px-4 py-2 cursor-pointer border-none"
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-[rgb(16,16,16)] py-4 flex justify-around items-center text-neutral-600 text-[22px] z-50">
        <Link to="/home/bites">
          <SidebarButton icon={faHouse} label="Home" />
        </Link>
        <Link to="/home/search">
          <SidebarButton icon={faMagnifyingGlass} label="Search" />
        </Link>
        <SidebarButton icon={faPlus} label="Add" onClick={onOpenPostModal} />
        <Link to="/home/likes">
          <SidebarButton icon={faHeart} label="Likes" />
        </Link>
        {user?.username && (
          <Link to={`/user/${user.username}`}>
            <SidebarButton icon={faUser} label="Profile" />
          </Link>
        )}
      </div>
    </>
  );
}
