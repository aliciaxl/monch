// pages/LikesPage.jsx
import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import Feed from "../components/Feed";
import Spinner from "./Spinner";

export default function LikesPage() {
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const res = await apiClient.get("/likes/liked-posts/", {
          withCredentials: true,
        });
        setLikedPosts(res.data);
      } catch (error) {
        console.error("Error fetching liked posts:", error);
        setLikedPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedPosts();
  }, []);
return (
  <div className="flex h-screen w-full text-white flex-col">

    <div className="flex text-m font-semibold justify-center text-neutral-500">
      <span className="w-32 py-4 text-center text-white">Liked</span>
    </div>

    {/* Main Content */}
    <div className="flex-1 flex-col justify-center w-160 items-center pt-4 rounded-t-3xl border-neutral-800 bg-neutral-900 mx-auto">
      {loading ? (
        <Spinner />
      ) : (
        <Feed posts={likedPosts} noTopBorder={true} />
      )}
    </div>
  </div>
);
}
