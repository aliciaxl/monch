import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/apiClient";

export default function FollowList({
  username,
  initialTab = "followers",
  onClose,
}) {
  const [tab, setTab] = useState(initialTab);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followState, setFollowState] = useState({});
  const [loadingFollow, setLoadingFollow] = useState({});
  const contentRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState("auto");

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(`/users/${username}/${tab}/`, { withCredentials: true })
      .then((res) => {
        setList(res.data);

        // Check follow state for all users in list
        Promise.all(
          res.data.map((user) =>
            apiClient
              .get("/follows/is_following/", {
                withCredentials: true,
                params: { username: user.username },
              })
              .then((res) => [user.id, res.data.is_following])
              .catch(() => [user.id, false])
          )
        ).then((results) => {
          setFollowState(Object.fromEntries(results));
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tab, username]);

  useEffect(() => {
  if (contentRef.current) {
    const resize = () => {
      const newHeight = contentRef.current.scrollHeight;
      setContainerHeight(`${newHeight}px`);
    };

    const timeout = setTimeout(resize, 50);
    return () => clearTimeout(timeout);
  }
}, [list.length, loading]);


  const handleFollowToggle = async (targetUser) => {
    const id = targetUser.id;
    if (loadingFollow[id]) return;

    setLoadingFollow((prev) => ({ ...prev, [id]: true }));

    try {
      await apiClient.post(
        "/follows/toggle/",
        { username: targetUser.username },
        { withCredentials: true }
      );

      setFollowState((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    } catch (error) {
      console.error("Follow toggle failed:", error);
    } finally {
      setLoadingFollow((prev) => ({ ...prev, [id]: false }));
    }
  };

  const FollowListItem = React.memo(function FollowListItem({
  user,
  isFollowing,
  isLoading,
  onToggle,
  onClose,
}) {
  return (
    <div
      className="flex w-full justify-between border-b border-neutral-800 px-8 py-6 bg-neutral-900"
    >
      <div className="flex items-start">
        <div className="self-start flex-none w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-semibold overflow-hidden mr-4">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={`${user.username} avatar`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>
              {user.display_name?.[0]?.toUpperCase() ||
                user.username[0]?.toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex flex-col text-left">
          <Link
            to={`/user/${user.username}`}
            className="text-sm font-bold text-white"
            onClick={onClose}
          >
            @{user.username}
          </Link>
          <div className="text-sm text-neutral-400">
            {user.display_name || user.username}
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <button
          disabled={isLoading}
          onClick={onToggle}
          className={`transform transition-transform active:scale-[.95] duration-150 h-10 px-4 border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
            ${
              isFollowing
                ? "bg-neutral-900 hover:bg-neutral-700 border-neutral-700 text-white"
                : "bg-white text-black border-neutral-300 hover:bg-neutral-200"
            }`}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      </div>
    </div>
  );
});


  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50"
      onMouseDown={onClose}
    >
      <div
        className="flex flex-col w-136 max-h-[92vh] rounded-xl border-[0.5px]  border-neutral-700 bg-neutral-900 text-white shadow-lg overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b-[0.5px] border-neutral-700">
          {/* Close button on its own row */}
          <div className="flex justify-end pt-2 pr-4 -mb-1">
            <button
              onClick={onClose}
              className="text-sm text-neutral-700 hover:text-white cursor-pointer"
              aria-label="Close follow list"
            >
              ✕
            </button>
          </div>

          {/* Tabs: Followers and Following */}
          <div className="flex font-semibold text-neutral-500 w-full ">
            <button
              onClick={() => setTab("followers")}
              className={`flex flex-grow pb-4 text-center justify-center cursor-pointer border-b sm:w-32 ${
                tab === "followers"
                  ? "text-white border-neutral-300"
                  : "border-transparent hover:text-white"
              }`}
            >
              Followers
            </button>
            <button
              onClick={() => setTab("following")}
              className={`flex flex-grow pb-4 text-center justify-center cursor-pointer border-b sm:w-32 ${
                tab === "following"
                  ? "text-white border-neutral-300"
                  : "border-transparent hover:text-white"
              }`}
            >
              Following
            </button>
          </div>
        </div>

        {/* List */}
        <div
          className="transition-all duration-300 ease-in-out overflow-hidden"
          style={{ height: containerHeight }}
        >
          <div ref={contentRef} className="overflow-y-auto max-h-[72vh]">
            {loading ? (
              null
            ) : list.length === 0 ? (
              <div className="p-6 text-neutral-400 text-center">
                No {tab} yet.
              </div>
            ) : (
              list.map((user) => (
                <FollowListItem
    key={user.id}
    user={user}
    isFollowing={followState[user.id]}
    isLoading={loadingFollow[user.id]}
    onToggle={() => handleFollowToggle(user)}
    onClose={onClose}
  />
              ))
            )}
          </div>
          </div>
      </div>
    </div>
  );
}
