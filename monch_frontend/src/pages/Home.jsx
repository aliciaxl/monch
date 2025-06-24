import { useEffect, useState } from "react";
import { apiFetch } from "../apiFetch.jsx"
import Sidebar from "../components/Sidebar";
import PostInput from "../components/PostInput";
import Feed from "../components/Feed";

export default function Home() {
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("bites");

  useEffect(() => {
    const endpoint =
      tab === "following"
        ? "http://127.0.0.1:8000/api/posts/following/"
        : "http://127.0.0.1:8000/api/posts/";

    const fetchPosts = async () => {
      try {
        let res = await apiFetch(endpoint, { credentials: "include" });

        if (res.status === 401) {
          const refreshRes = await apiFetch(
            "http://127.0.0.1:8000/api/token/refresh/",
            {
              method: "POST",
              credentials: "include",
            }
          );

          if (!refreshRes.ok) {
            console.log(
              "Refresh token expired or invalid, redirecting to login"
            );
            setPosts([]);
            return;
          }

          res = await apiFetch(endpoint, { credentials: "include" });
        }

        if (!res.ok) throw new Error(`Failed with status ${res.status}`);

        const data = await res.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
      }
    };

    fetchPosts();
  }, [tab]);

  const handlePost = (parentPostId = null) => {
    if (!newPost.trim()) return;

    setLoading(true);

    
  const payload = {
    content: newPost,
    parent_post_id: parentPostId, // assuming this is not a reply
    // user_id: "abc123", // optional if backend infers from session
    // created_at: new Date().toISOString(), // usually backend-generated
  };

    apiFetch("http://127.0.0.1:8000/api/posts/", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to post");
        return res.json();
      })
      .then((post) => {
        setPosts((prev) => [post, ...prev]);
        setNewPost("");
      })
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false));
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
