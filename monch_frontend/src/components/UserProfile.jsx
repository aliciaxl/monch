// pages/UserProfile.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Feed from "../components/Feed";
import Sidebar from "../components/Sidebar";

export default function UserProfile() {
  const { username } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Fetch current logged-in user info (adjust URL as needed)
    async function fetchCurrentUser() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/me/", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch current user");
        const data = await res.json();
        setCurrentUser(data.username);
      } catch {
        setCurrentUser(null);
      }
    }
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      try {
        setLoading(true);
        const [userRes, postsRes] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/users/${username}/`, { credentials: "include" }),
          fetch(`http://127.0.0.1:8000/api/users/${username}/posts/`, { credentials: "include" }),
        ]);

        if (!userRes.ok) throw new Error("Failed to fetch user data");
        if (!postsRes.ok) throw new Error("Failed to fetch posts");

        const userData = await userRes.json();
        const postsData = await postsRes.json();

        setUserData(userData);
        setPosts(postsData);
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
                            {userData?.followers_count !== undefined
                            ? `${userData.followers_count} follower${userData.followers_count === 1 ? "" : "s"}`
                            : "0 followers"}
                        </p>
                    </div>
                    <div className="flex-start w-16 h-16 rounded-full bg-neutral-700 flex items-center justify-center text-white text-xl font-semibold">
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
                <button
                    // onClick={handleFollow}
                    className="w-full h-10 bg-neutral-900 hover:bg-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-4 border border-neutral-700 rounded-xl text-white"
                >
                    Follow
                </button>
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
