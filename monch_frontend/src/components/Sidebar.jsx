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
        <button className="hover:text-white cursor-pointer mb-4" aria-label="More">
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>
    </div>
  );
}