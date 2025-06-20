import React, { useEffect, useState } from "react";
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
        let res = await fetch(endpoint, { credentials: "include" });

        if (res.status === 401) {
          const refreshRes = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
            method: 'POST',
            credentials: 'include',
          });

          if (!refreshRes.ok) {
            console.log("Refresh token expired or invalid, redirecting to login");
            setPosts([]);
            return;
          }

          res = await fetch(endpoint, { credentials: "include" });
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

  const handlePost = () => {
    if (!newPost.trim()) return;

    setLoading(true);
    fetch("http://127.0.0.1:8000/api/posts/", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newPost }),
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
      <Sidebar />
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
        <div className="flex-1 flex-col justify-center w-160 items-center pt-8 rounded-3xl border-neutral-800 bg-neutral-900">
          <PostInput
            newPost={newPost}
            setNewPost={setNewPost}
            handlePost={handlePost}
            loading={loading}
          />
          <Feed posts={posts} />
        </div>
      </div>
    </div>
  );
}
