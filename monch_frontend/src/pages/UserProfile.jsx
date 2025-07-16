// pages/UserProfile.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { usePostContext } from "../context/PostContext.jsx";
import apiClient from "../api/apiClient.js";
import Feed from "../components/Feed.jsx";
import EditProfile from "../popups/EditProfile.jsx";
import FollowList from "../popups/FollowList.jsx";
import SmallSpinner from "../components/SmallSpinner.jsx";

export default function UserProfile() {
  const { user } = useAuth();
  const currentUser = user?.username;
  const { username } = useParams();
  const [showAvatarZoom, setShowAvatarZoom] = useState(false);
  const [avatarFadeIn, setAvatarFadeIn] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileFadeIn, setProfileFadeIn] = useState(false);
  const [feedFadeIn, setFeedFadeIn] = useState(false);
  const [posts, setPosts] = useState([]);
  const { postsNeedRefresh, setPostsNeedRefresh } = usePostContext();
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [toggleTrigger, setToggleTrigger] = useState(false);
  const [tab, setTab] = useState("bites");
  const [followModalTab, setFollowModalTab] = useState(null);

  const fetchUserData = async () => {
    try {
      setLoadingUser(true);
      const res = await apiClient.get(`/users/${username}/`, {
        withCredentials: true,
      });
      setUserData(res.data);
    } catch (error) {
      console.error("Failed to load user data:", error);
      setUserData(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [username]);

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      let res;
      if (tab === "bites") {
        res = await apiClient.get(`/users/${username}/posts/`, {
          withCredentials: true,
        });
      } else {
        res = await apiClient.get(`/users/${username}/replies/`, {
          withCredentials: true,
        });
      }
      setPosts(res.data);
    } catch (error) {
      console.error("Failed to load posts:", error);
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [username, tab]);

  useEffect(() => {
    if (userData) {
      requestAnimationFrame(() => setProfileFadeIn(true));
    }
  }, [userData]);

  useEffect(() => {
    if (!loadingUser) {
      requestAnimationFrame(() => setFeedFadeIn(true));
    } else {
      setFeedFadeIn(false);
    }
  }, [loadingUser]);

  useEffect(() => {
    if (!loadingPosts) {
      requestAnimationFrame(() => setFeedFadeIn(true));
    } else {
      setFeedFadeIn(false);
    }
  }, [loadingPosts]);

  useEffect(() => {
    async function checkFollowing() {
      if (!currentUser || !username) return;

      try {
        const res = await apiClient.get("/follows/is_following/", {
          withCredentials: true,
          params: { username },
        });
        setIsFollowing(res.data.is_following);
      } catch (error) {
        console.error(error);
      }
    }

    checkFollowing();
  }, [username, currentUser, toggleTrigger]);

  useEffect(() => {
    if (postsNeedRefresh) {
      fetchUserAndPosts();
      setPostsNeedRefresh(false);
    }
  }, [postsNeedRefresh]);

  const fetchUserAndPosts = async () => {
    await Promise.all([fetchUserData(), fetchPosts()]);
  };

  const handleFollowToggle = async () => {
    if (loadingFollow) return;

    setLoadingFollow(true);

    try {
      await apiClient.post(
        "/follows/toggle/",
        { username },
        { withCredentials: true }
      );

      const updatedUser = await apiClient.get(`/users/${username}/`, {
        withCredentials: true,
      });

      setUserData(updatedUser.data);
      setIsFollowing(updatedUser.data.is_following);

      setToggleTrigger((prev) => !prev);
    } catch (error) {
      console.error(error);
      alert("Failed to toggle follow");
    } finally {
      setLoadingFollow(false);
    }
  };

  useEffect(() => {
    if (showAvatarZoom) {
      requestAnimationFrame(() => setAvatarFadeIn(true));
    } else {
      setAvatarFadeIn(false);
    }
  }, [showAvatarZoom]);

  const handleSave = async (formData) => {
    try {
      const res = await apiClient.patch(`/users/${user.username}/`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUserData(res.data);
      setShowEditModal(false);
    } catch (error) {
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="home flex flex-col flex-grow w-full h-full text-whitesm:px-0">
      <div className="flex flex-col flex-1 w-full mx-auto">
        {/* TITLE */}
        <div className="flex text-m font-semibold justify-center text-neutral-500 sm:bg-transparent bg-[rgb(16,16,16)]">
          <span className="w-32 py-4 text-center text-white">Profile</span>
        </div>

        {/* FEED */}
        <div className="flex flex-grow flex-col w-full min-w-full pt-8 sm:rounded-t-3xl border-t border-neutral-800 bg-neutral-900">
          {/* Profile info section */}
          <div
            className={`transition-opacity duration-500 ${
              profileFadeIn ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="px-6">
              <div className="flex items-start justify-between mb-4 w-full">
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-white">
                    {userData?.display_name.toUpperCase() ||
                      username.toUpperCase()}
                  </h2>
                  <p className="text-neutral-400 mb-4">@{username}</p>
                  <p className="text-white mb-4">{userData?.bio || ""}</p>

                  {/* Follow Info  */}
                  <div className="flex gap-4 text-neutral-600 mt-1">
                    <button
                      onClick={() => setFollowModalTab("followers")}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="text-neutral-300">
                        {userData?.follower_count}
                      </span>{" "}
                      follower{userData?.follower_count === 1 ? "" : "s"}
                    </button>
                    <button
                      onClick={() => setFollowModalTab("following")}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="text-neutral-300">
                        {userData?.following_count}
                      </span>{" "}
                      following
                    </button>
                  </div>
                </div>
                {/* Avatar Circle */}
                <div
                  onClick={() => userData?.avatar && setShowAvatarZoom(true)}
                  className="self-start flex-none w-16 h-16 rounded-full bg-neutral-700 flex items-center justify-center text-white text-xl font-semibold cursor-pointer"
                >
                  {userData?.avatar ? (
                    <img
                      src={userData.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span>
                      {username[0]?.toUpperCase() ||
                        userData?.display_name?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {currentUser === username ? (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="transform transition-transform active:scale-[.95] duration-150 w-full h-10 bg-neutral-900 hover:bg-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-4 border-[0.5px] border-neutral-700 rounded-xl text-white"
                >
                  Edit Profile
                </button>
              ) : (
                currentUser !== username && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={loadingFollow}
                    className={`w-full h-10 px-4 border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                      ${
                        isFollowing
                          ? "bg-neutral-900 hover:bg-neutral-700 border-neutral-700 text-white"
                          : "bg-white text-black border-neutral-300 hover:bg-neutral-200"
                      }`}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
                )
              )}
            </div>
          </div>
          {/* Tabs */}
          <div className="flex text-m font-semibold justify-center text-neutral-500 mt-3 border-b border-neutral-800">
            <button
              onClick={() => setTab("bites")}
              className={`flex-1 w-32 py-4 text-center border-b cursor-pointer ${
                tab === "bites"
                  ? "text-white border-neutral-300"
                  : "border-transparent hover:text-white"
              }`}
            >
              Bites
            </button>
            <button
              onClick={() => setTab("replies")}
              className={`flex-1 w-32 py-4 text-center border-b cursor-pointer ${
                tab === "replies"
                  ? "text-white border-neutral-300"
                  : "border-transparent hover:text-white"
              }`}
            >
              Replies
            </button>
          </div>
          <div className="relative">
            {/* Spinner will remain visible while loadingPosts is true */}
            {loadingPosts ? (
              <div className="flex justify-center items-center py-60">
                <SmallSpinner />
              </div>
            ) : (
              <div
                className={`transition-opacity duration-500 ease-in-out ${
                  feedFadeIn ? "opacity-100" : "opacity-0"
                }`}
              >
                <Feed
                  posts={posts}
                  isOwner={currentUser === username}
                  onPostDeleted={fetchPosts}
                  isLoading={false}
                  noTopBorder={true}
                  showRepliesWithParents={tab === "replies"}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {showAvatarZoom && (
        <div
          onClick={() => setShowAvatarZoom(false)}
          className={`fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-xl flex items-center justify-center
    transition-opacity duration-500 ${avatarFadeIn ? "opacity-100" : "opacity-0"}`}
        >
          {/* Close button */}
          <button
            onClick={() => setShowAvatarZoom(false)}
            className="absolute top-4 right-6 text-neutral-200 text-3xl font-extralight hover:opacity-50 transition-opacity cursor-pointer"
            aria-label="Close"
          >
            ×
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[90vh]"
          >
            <img
              src={userData.avatar}
              alt="Zoomed avatar"
              className="w-80 h-80 object-cover rounded-full shadow-xl"
            />
          </div>
        </div>
      )}
      {followModalTab && (
        <FollowList
          username={username}
          initialTab={followModalTab} // "followers" or "following"
          onClose={() => setFollowModalTab(null)}
        />
      )}
      {showEditModal && userData && (
        <EditProfile
          user={userData}
          onSave={handleSave}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}
