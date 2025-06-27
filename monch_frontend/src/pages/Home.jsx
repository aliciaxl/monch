import { useEffect, useState } from "react";
import apiClient from "../api/apiClient.js"
import PostInput from "../components/PostInput";
import Feed from "../components/Feed";

export default function Home() {
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("bites");

useEffect(() => {
    const endpoint = tab === "following" ? "/posts/following/" : "/posts/";

    const fetchPosts = async () => {
      try {
        let res = await apiClient.get(endpoint, { withCredentials: true });
        setPosts(res.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
      }
    };

    fetchPosts();
  }, [tab]);


  const handlePost = async (parentPostId = null) => {
    if (!newPost.trim()) return;

    setLoading(true);

    const payload = {
      content: newPost,
      parent_post_id: parentPostId,
    };

    try {
      const res = await apiClient.post("/posts/", payload, { withCredentials: true });
      setPosts((prev) => [res.data, ...prev]);
      setNewPost("");
    } catch (err) {
      alert(err.message || "Failed to post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full text-white">
      <div className="flex flex-col">
        {/* Tabs */}
        <div className="flex text-m font-semibold justify-center text-neutral-500">
          <button
            onClick={() => setTab("bites")}
            className={`w-32 py-4 text-center border-b ${
              tab === "bites"
                ? "text-white border-neutral-300"
                : "border-transparent hover:text-white"
            }`}
          >
            Bites
          </button>
          <button
            onClick={() => setTab("following")}
            className={`w-32 py-4 text-center border-b ${
              tab === "following"
                ? "text-white border-neutral-300"
                : "border-transparent hover:text-white"
            }`}
          >
            Following
          </button>
        </div>

        {/* Post Input and Feed */}
        <div className="flex-1 flex-col justify-center w-160 items-center pt-8 rounded-t-3xl border-neutral-800 bg-neutral-900">
          <PostInput
            newPost={newPost}
            setNewPost={setNewPost}
            handlePost={() => handlePost(null)}
            loading={loading}
          />
          <Feed posts={posts} />
        </div>
      </div>
    </div>
  );
}
