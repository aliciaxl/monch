import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { apiFetch } from "../apiFetch.jsx"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faMagnifyingGlass,
  faHeart,
  faUser,
  faPlus,
  faBars,
  faDragon,
} from "@fortawesome/free-solid-svg-icons";

function SidebarButton({ icon, label }) {
  return (
    <button className="hover:text-white cursor-pointer" aria-label={label}>
      <FontAwesomeIcon icon={icon} />
    </button>
  );
}

export default function Sidebar() {
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const toggleMenu = () => setShowMenu((prev) => !prev);

  const logout = async () => {
     try {
    const res = await apiFetch('http://127.0.0.1:8000/api/logout/', {
      method: 'POST',
      credentials: 'include', // include cookies
    });

    if (!res.ok) {
      throw new Error('Logout failed');
    }
    
    setUser(null); // Clear any local user state
    navigate('/login'); // Redirect to login
  } catch (err) {
    alert(err.message);
  }
  };

  return (
    <div className="fixed top-0 left-0 h-full w-12 text-2xl flex flex-col justify-between items-center mx-4 py-4 text-neutral-600">
      <div>
        <button className="text-white" aria-label="Profile">
          <FontAwesomeIcon icon={faDragon} />
        </button>
      </div>
      <div className="flex flex-col space-y-8">
        <SidebarButton icon={faHouse} label="Home" />
        <SidebarButton icon={faMagnifyingGlass} label="Search" />
        <SidebarButton icon={faPlus} label="Add" />
        <SidebarButton icon={faHeart} label="Likes" />
        <SidebarButton icon={faUser} label="Profile" />
      </div>
      <div>
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
              ${showMenu
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-75 pointer-events-none'
              }
            `}
            style={{
              transform: showMenu ? 'translate(0, 0) scale(1)' : 'translate(-10px, 10px) scale(0.75)',
            }}
          >
            <button
              onClick={logout}
              className="w-full text-left font-semibold text-sm px-4 py-2 cursor-pointer border-none"
            >
              Log out
            </button>
            {/* Add more options here */}
          </div>
      </div>
    </div>
  );
}