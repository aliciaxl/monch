import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const scrollPositions = {};

export default function ScrollRestoration() {
  const location = useLocation();
  const prevPathname = useRef(location.pathname);

  useEffect(() => {
    // Disable native scroll restoration to prevent conflict
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    // Save scroll before navigating away
    scrollPositions[prevPathname.current] = window.scrollY || 0;
    prevPathname.current = location.pathname;

    // Restore scroll after render
    const handle = setTimeout(() => {
      const y = scrollPositions[location.pathname] || 0;
      window.scrollTo(0, y);
    }, 0);

    return () => clearTimeout(handle);
  }, [location.pathname]);

  return null;
}


//need to fix