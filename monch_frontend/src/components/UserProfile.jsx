// pages/UserProfile.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/apiClient.js"
import Feed from "../components/Feed";

export default function UserProfile() {
  const { user: currentUser } = useAuth();
  const { username } = useParams();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);


  useEffect(() => {
    const fetchUserAndPosts = async () => {
      try {
        setLoading(true);

        const [userRes, postsRes] = await Promise.all([
          apiClient.get(`/users/${username}/`, { withCredentials: true }),
          apiClient.get(`/users/${username}/posts/`, { withCredentials: true }),
        ]);

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

    fetchUserAndPosts();
  }, [username]);


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
  }, [username, currentUser]);


  const handleFollowToggle = async () => {
    if (loadingFollow) return;

    setLoadingFollow(true);

    try {
      const res = await apiClient.post(
        "/follows/toggle/",
        { username }, // body
        { withCredentials: true }
      );

      setIsFollowing(res.data.status === "followed");

      setUserData((prev) => ({
        ...prev,
        follower_count:
          prev.follower_count + (res.data.status === "followed" ? 1 : -1),
      }));
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoadingFollow(false);
    }
  };

  return (
    <>
        <div className="flex text-m font-semibold justify-center text-neutral-500 ">
            <span className="w-32 py-4 text-center text-white">Profile</span>
        </div>
        <div className="flex-1 flex-col h-screen justify-center w-160 items-center pt-8 rounded-t-3xl border-neutral-800 bg-neutral-900">
            <div className="px-6">
                <div className="flex items-start justify-between mb-4 w-full">
                    <div className="text-left">
                        <h2 className="text-2xl font-bold text-white">{userData?.display_name.toUpperCase() || username.toUpperCase()}</h2>
                        <p className="text-neutral-400 mb-4">@{username}</p>
                        <p className="text-white mb-4">{userData?.bio || "No bio available"}</p>
                        <p className="text-neutral-500 mt-1">
                            {userData?.follower_count !== undefined
                            ? `${userData.follower_count} follower${userData.follower_count === 1 ? "" : "s"}`
                            : "0 followers"}
                        </p>
                    </div>
                    <div className="self-start flex-none w-16 h-16 rounded-full bg-neutral-700 flex items-center justify-center text-white text-xl font-semibold">
                        {userData?.display_name?.[0]?.toUpperCase() || username[0].toUpperCase()}
                    </div>
                </div>

                {currentUser === username ? (
                <button 
                    // onClick={updateBio}
                    className="w-full h-10 bg-neutral-900 hover:bg-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-4 border border-neutral-700 rounded-xl text-white">
                    Edit Profile
                </button>
                ) : (
                currentUser !== username && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={loadingFollow}
                    className={`w-full h-10 px-4 border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                      ${isFollowing 
                        ? "bg-neutral-900 hover:bg-neutral-700 border-neutral-700 text-white" // Unfollow: dark button
                        : "bg-white text-black border-neutral-300 hover:bg-neutral-200" // Follow: white button
                      }`}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
                )
              )}
            </div>
            {loading ? (
                <p className="text-neutral-400">Loading...</p>
            ) : (
                <Feed posts={posts} />
            )}
        </div>
        
    </>
    
  );
}
