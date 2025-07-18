// pages/UserProfile.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
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

  const [loadingUser, setLoadingUser] = useState(true);
  const [userData, setUserData] = useState(null);

  const [postsByTab, setPostsByTab] = useState({
    bites: [],
    replies: [],
  });
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [hasLoadedOnceByTab, setHasLoadedOnceByTab] = useState({
    bites: false,
    replies: false,
  });

  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [toggleTrigger, setToggleTrigger] = useState(false);

  const [tab, setTab] = useState("bites");
  const [followModalTab, setFollowModalTab] = useState(null);

  const { postsNeedRefresh, setPostsNeedRefresh } = usePostContext();

  const isFetchingRef = useRef({ bites: false, replies: false });

  // Fetch user data
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

  ///////////////////////////// FETCH POST ///////////////////////////////////
  const fetchPosts = async (tabToFetch = tab) => {
    if (
      loadingPosts ||
      hasLoadedOnceByTab[tabToFetch] ||
      isFetchingRef.current[tabToFetch]
    )
      return;

    isFetchingRef.current[tabToFetch] = true;
    setLoadingPosts(true);

    try {
      let res;
      if (tabToFetch === "bites") {
        res = await apiClient.get(`/users/${username}/posts/`, {
          withCredentials: true,
        });
      } else {
        res = await apiClient.get(`/users/${username}/replies/`, {
          withCredentials: true,
        });
      }

      setPostsByTab((prev) => ({
        ...prev,
        [tabToFetch]: res.data,
      }));

      setHasLoadedOnceByTab((prev) => ({
        ...prev,
        [tabToFetch]: true,
      }));
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setLoadingPosts(false);
      isFetchingRef.current[tabToFetch] = false;
    }
  };

  // Combined fetch for user and posts
  const fetchUserAndPosts = async () => {
    await fetchUserData();
  };

  // Reset data and tab when username changes
  useEffect(() => {
    // Reset the posts and loaded state for both "bites" and "replies" tabs
    setPostsByTab({
      bites: [],
      replies: [],
    });
    setHasLoadedOnceByTab({
      bites: false,
      replies: false,
    });

    // Reset to the "bites" tab when username changes
    setTab("bites");

    // Fetch fresh data
    fetchUserData();
  }, [username]);

  useEffect(() => {
    if (!hasLoadedOnceByTab[tab] && username) {
      fetchPosts(tab);
    }
  }, [tab, username, hasLoadedOnceByTab]);

  // Profile fade in
  useEffect(() => {
    if (userData) {
      requestAnimationFrame(() => setProfileFadeIn(true));
    }
  }, [userData]);

  useEffect(() => {
    if (hasLoadedOnceByTab[tab]) {
      // Only trigger fade-in if posts are already loaded (no need for fade when switching between tabs)
      requestAnimationFrame(() => setFeedFadeIn(true));
    } else {
      setFeedFadeIn(false);
    }
  }, [tab, hasLoadedOnceByTab]);

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
      setPostsNeedRefresh(false);
      setHasLoadedOnceByTab({ bites: false, replies: false });
    }
  }, [postsNeedRefresh]);

  // Follow/unfollow toggle
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

  // Avatar zoom fade
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

      const updatedUserData = res.data;

      // If avatar has been updated, update posts in both tabs
      if (updatedUserData.avatar !== userData.avatar) {
        const updatedAvatar = updatedUserData.avatar;

        setPostsByTab((prevPosts) => {
          const updatedBites = prevPosts.bites.map((post) => {
            if (post.user.username === user.username) {
              return { ...post, user: { ...post.user, avatar: updatedAvatar } };
            }
            return post;
          });

          const updatedReplies = prevPosts.replies.map((post) => {
            if (post.user.username === user.username) {
              return { ...post, user: { ...post.user, avatar: updatedAvatar } };
            }
            return post;
          });

          return {
            ...prevPosts,
            bites: updatedBites,
            replies: updatedReplies,
          };
        });
      }

      // Update userData
      setUserData(updatedUserData);

      // Close edit modal
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating profile:", error);
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
                    {userData?.display_name?.toUpperCase() ||
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
                  className="self-start flex-none w-16 h-16 rounded-full overflow-hidden bg-neutral-700 flex items-center justify-center text-white text-xl font-semibold cursor-pointer"
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

              {/* Edit or Follow button */}
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
                  ? "border-white text-white"
                  : "border-transparent hover:text-white"
              }`}
            >
              Bites
            </button>
            <button
              onClick={() => setTab("replies")}
              className={`flex-1 w-32 py-4 text-center border-b cursor-pointer ${
                tab === "replies"
                  ? "border-white text-white"
                  : "border-transparent hover:text-white"
              }`}
            >
              Replies
            </button>
          </div>

          {/* Posts Feed */}
          {loadingPosts && !hasLoadedOnceByTab[tab] ? (
            <div className="flex justify-center items-center py-60">
              <SmallSpinner />
            </div>
          ) : (
            <div
              className={`transition-opacity duration-500 ease-in-out pb-[65px] sm:pb-0 ${
                feedFadeIn ? "opacity-100" : "opacity-0"
              }`}
            >
              <Feed
                posts={postsByTab[tab]}
                isOwner={currentUser === username}
                onPostDeleted={() => {
                  setHasLoadedOnceByTab((prev) => ({ ...prev, [tab]: false }));
                }}
                isLoading={false}
                noTopBorder={true}
                showRepliesWithParents={tab === "replies"}
              />
            </div>
          )}

          {/* Avatar Zoom Modal */}
          {showAvatarZoom && (
            <div
              className={`fixed top-0 left-0 z-50 w-full h-full bg-black/80 flex justify-center items-center transition-opacity duration-200 ${
                avatarFadeIn ? "opacity-100" : "opacity-0"
              }`}
              onClick={() => setShowAvatarZoom(false)}
            >
              <div className="w-[90vw] max-w-[360px] aspect-square rounded-full overflow-hidden">
                <img
                  src={userData.avatar}
                  alt="Avatar Zoom"
                  className="w-full h-full object-cover cursor-zoom-out"
                />
              </div>
            </div>
          )}

          {/* Edit Profile Modal */}
          {showEditModal && (
            <EditProfile
              onClose={() => setShowEditModal(false)}
              onSave={handleSave}
              user={userData}
            />
          )}

          {/* Follow List Modal */}
          {followModalTab && (
            <FollowList
              username={username}
              listType={followModalTab}
              onClose={() => setFollowModalTab(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
