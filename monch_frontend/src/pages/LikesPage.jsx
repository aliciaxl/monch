// pages/LikesPage.jsx
import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import Feed from "../components/Feed";
import Spinner from "../components/Spinner";

export default function LikesPage() {
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchLikedPosts = async () => {
    try {
      const res = await apiClient.get("/likes/liked-posts/", {
        withCredentials: true,
      });

      const parentPostsOnly = res.data.filter(post => !post.parent_post_detail);

      setLikedPosts(parentPostsOnly);
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
  <div className="home flex flex-col flex-grow w-full h-full text-whitesm:px-0">
    <div className="flex flex-col flex-1 w-full mx-auto">

    <div className="flex font-semibold justify-center text-neutral-500 sm:bg-transparent bg-[rgb(16,16,16)]">
      <span className="w-32 py-4 text-center text-white">Liked</span>
    </div>

    {/* Main Content */}
    <div className="flex flex-grow flex-col w-full min-w-full sm:rounded-t-3xl border-t border-neutral-800 bg-neutral-900 overflow-hidden pb-[65px] sm:pb-0">
      {loading ? (
        <Spinner />
      ) : (
        <Feed posts={likedPosts} noTopBorder={true} />
      )}
    </div>
  </div>
  </div>
);
}
