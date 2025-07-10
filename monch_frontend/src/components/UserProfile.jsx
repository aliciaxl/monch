// pages/UserProfile.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePostContext } from "../context/PostContext";
import apiClient from "../api/apiClient.js";
import Feed from "../components/Feed";
import EditProfile from "./EditProfile";
import Spinner from "./Spinner.jsx";

export default function UserProfile() {
  const { user } = useAuth();
  const currentUser = user?.username;
  const { username } = useParams();
  const [showEditModal, setShowEditModal] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [posts, setPosts] = useState([]);
  const { postsNeedRefresh, setPostsNeedRefresh } = usePostContext();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [toggleTrigger, setToggleTrigger] = useState(false);
  const [tab, setTab] = useState("bites");

  const fetchUserAndPosts = async () => {
    try {
      setLoading(true);

      const userRes = await apiClient.get(`/users/${username}/`, {
        withCredentials: true,
      });

      let postsRes;
      if (tab === "bites") {
        postsRes = await apiClient.get(`/users/${username}/posts/`, {
          withCredentials: true,
        });
      } else if (tab === "replies") {
        postsRes = await apiClient.get(`/users/${username}/replies/`, {
          withCredentials: true,
        });
      }

      setUserData(userRes.data);
      setPosts(postsRes.data);
    } catch (error) {
      console.error("Failed to load user profile:", error);
      setUserData(null);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndPosts();
  }, [username, tab]);

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

  useEffect(() => {
    if (!loading) {
      requestAnimationFrame(() => setFadeIn(true));
    } else {
      setFadeIn(false);
    }
  }, [loading]);

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

  const handleSave = async (formData) => {
    try {
      const res = await apiClient.patch(`/users/${user.username}/`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUserData(res.data);
      fetchUserAndPosts();
    } catch (error) {
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <>
      <div className="flex text-m font-semibold justify-center text-neutral-500 ">
        <span className="w-32 py-4 text-center text-white">Profile</span>
      </div>
      <div className="flex-1 flex-col h-screen justify-center w-160 items-center pt-8 rounded-t-3xl border-neutral-800 bg-neutral-900">
          
          {/* Profile info section */}
          <div
            className={`transition-opacity duration-500 ${fadeIn ? "opacity-100" : "opacity-0"}`}
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
                  <p className="text-neutral-500 mt-1">
                    {userData?.follower_count !== undefined
                      ? `${userData.follower_count} follower${userData.follower_count === 1 ? "" : "s"}`
                      : ""}
                  </p>
                </div>
                {/* Avatar Circle */}
                <div className="self-start flex-none w-16 h-16 rounded-full bg-neutral-700 flex items-center justify-center text-white text-xl font-semibold">
                  {userData?.avatar ? (
                    <img
                      src={userData.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span>
                      {userData?.display_name?.[0]?.toUpperCase() ||
                        username[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {currentUser === username ? (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="transform transition-transform active:scale-[.95] duration-150 w-full h-10 bg-neutral-900 hover:bg-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-4 border border-neutral-700 rounded-xl text-white"
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

              {showEditModal && userData && (
                <EditProfile
                  user={userData}
                  onSave={handleSave}
                  onClose={() => setShowEditModal(false)}
                />
              )}
            </div>
          </div>


          <div className="flex text-m font-semibold justify-center text-neutral-500 border-b border-neutral-700 mt-3">
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
          {loading ? (
              <Spinner />
          ) : (
            <div
              className={`transition-opacity duration-500 ease-in-out ${
                fadeIn ? "opacity-100" : "opacity-0"
              }`}
            >
              <Feed
                posts={posts}
                isOwner={currentUser === username}
                onPostDeleted={fetchUserAndPosts}
                isLoading={loading}
              />
            </div>
          )}
      </div>
    </>
  );
}
