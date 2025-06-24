// pages/UserProfile.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Feed from "../components/Feed";
import Sidebar from "../components/Sidebar";

export default function UserProfile() {
  const { username } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/users/${username}/posts/`, {
          credentials: "include",
        });
        const data = await res.json();
        setPosts(data);
      } catch (error) {
        console.error("Failed to load user posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [username]);

  return (
    <>
        <div className="flex text-m font-semibold justify-center text-neutral-500 ">
            <span className="w-32 py-4 text-center text-white">Profile</span>
        </div>
        <div className="flex-1 flex-col h-screen justify-center w-160 items-center pt-8 rounded-t-3xl border-neutral-800 bg-neutral-900">
            <h1 className="text-2xl font-bold mb-4">{username}'s Profile</h1>
            {loading ? (
                <p className="text-neutral-400">Loading...</p>
            ) : (
                <Feed posts={posts} />
            )}
        </div>
        
    </>
    
  );
}
