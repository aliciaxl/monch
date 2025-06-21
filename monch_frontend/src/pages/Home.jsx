import "../App.css";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faMagnifyingGlass,
  faHeart,
  faUser,
  faPlus,
  faBars,
  faDragon,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";
import { formatDistanceToNow } from "date-fns";

function SidebarButton({ icon, label }) {
  return (
    <button className="hover:text-white cursor-pointer" aria-label={label}>
      <FontAwesomeIcon icon={icon} />
    </button>
  );
}

function Feed({ posts }) {
    if (!posts || posts.length === 0) {
        return <div className="text-neutral-500 px-8 pt-4">No posts yet.</div>;
    }
  
    return (
    <div className="w-full">
      {posts.map((post) => (
        <div
        key={post.id}
        className="flex items-start w-full border-b border-neutral-800 px-8 p-4 bg-neutral-900"
        >
            
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-semibold mr-4">
                {post.user[0]?.toUpperCase()}
            </div>
            {/* Username and Created at */}
            <div>
                <div className="flex text-sm text-neutral-400 mb-1">
                <span className="font-semibold text-white mr-2">{post.user}</span>
                {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                })}
                </div>
                {/* Post Content */}
                <div className="text-white text-base">{post.content}</div>
                {/* Interaction Buttons */}
                <div className="flex space-x-4 mt-4 text-sm text-neutral-400">
                    <button className="hover:text-white flex items-center space-x-1">
                        <FontAwesomeIcon icon={faHeart} />
                        <span>{post.likes || 0}</span>
                    </button>
                    <button className="hover:text-white flex items-center space-x-1">
                        <FontAwesomeIcon icon={faCommentDots} />
                    </button>
                </div>
            </div>
        </div>
      ))}
    </div>
  );
}

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
        // Try refresh token
        const refreshRes = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
          method: 'POST',
          credentials: 'include',
        });

        if (!refreshRes.ok) {
          // Refresh failed, redirect to login or handle accordingly
          console.log("Refresh token expired or invalid, redirecting to login");
          setPosts([]);
          return;
        }

        // Retry original request after refresh
        res = await fetch(endpoint, { credentials: "include" });
      }

      if (!res.ok) {
        throw new Error(`Failed with status ${res.status}`);
      }

      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);  // Clear posts to avoid React errors
    }
  };

  fetchPosts();
}, [tab]);


  const handlePost = () => {
    if (!newPost.trim()) return; // prevent empty posts

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
    <>
      <div className="flex h-screen w-full text-white">
        {/* Sidebar */}
        <div className="fixed top-0 left-0 h-full w-12 text-2xl flex flex-col justify-between items-center mx-4 py-4 text-neutral-600">
          <div>
            <button className="text-white" aria-label="Profile">
              <FontAwesomeIcon icon={faDragon} />
            </button>
          </div>
          <div className="flex flex-col space-y-8">
            <SidebarButton icon={faHouse} label="Home" />
            <SidebarButton icon={faMagnifyingGlass} label="Search" />
            <SidebarButton icon={faPlus} label="Add" />
            <SidebarButton icon={faHeart} label="Likes" />
            <SidebarButton icon={faUser} label="Profile" />
          </div>
          <div>
            <button
              className="hover:text-white cursor-pointer mb-4"
              aria-label="Profile"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-col">
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
          {/* feed */}
          <div className="flex-1 flex-col justify-center w-160 items-center pt-8 rounded-3xl border-neutral-800 bg-neutral-900">
            <div className="flex items-start border-b border-neutral-800 bg-neutral-900 px-8 pb-4">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind?"
                rows={1}
                className="focus:outline-none focus:ring-0 h-12 w-full resize-none rounded-md bg-neutral-900 text-white px-2 pt-2"
              />
              <button
                onClick={handlePost}
                disabled={loading || !newPost.trim()}
                className="h-10 bg-neutral-900 hover:bg-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-4 border border-neutral-700 rounded-xl text-white"
              >
                {loading ? "Posting..." : "Post"}
              </button>
            </div>
            <Feed posts={posts}/>
          </div>
        </div>
      </div>
    </>
  );
}
