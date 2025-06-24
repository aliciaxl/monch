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
                <div className="flex items-center justify-between mb-4 w-full">
                    <div className="text-left">
                        <h2 className="text-2xl font-bold text-white">{userData?.display_name.toUpperCase() || username}</h2>
                        <p className="text-neutral-400">@{username}</p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-neutral-700 flex items-center justify-center text-white text-xl font-semibold">
                        {userData?.display_name?.[0]?.toUpperCase() || username[0].toUpperCase()}
                    </div>
                </div>

                {/* Edit Profile button */}
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-semibold">
                    Edit Profile
                </button>
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
