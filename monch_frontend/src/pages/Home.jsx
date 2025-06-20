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
} from "@fortawesome/free-solid-svg-icons";
import { formatDistanceToNow } from "date-fns";

function SidebarButton({ icon, label }) {
  return (
    <button className="hover:text-white cursor-pointer" aria-label={label}>
      <FontAwesomeIcon icon={icon} />
    </button>
  );
}

function Feed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/posts/", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error("Failed to fetch posts:", err));
  }, []);

  return (
    <div className="w-full">
      {posts.map((post) => (
        <div
          key={post.id}
          className="flex items-start w-full border-b border-neutral-800 px-8 p-4 bg-neutral-900"
        >
          <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-semibold mr-4">
            {post.user[0]?.toUpperCase()}
          </div>
          <div>
            <div className="flex text-sm text-neutral-400 mb-1">
              <span className="font-semibold text-white mr-2">{post.user}</span>
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
              })}
            </div>
            <div className="text-white text-base">{post.content}</div>
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

  // Move posts fetch here to keep posts state in Home
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/posts/", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error("Failed to fetch posts:", err));
  }, []);

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

        {/* Main Content */}
        <div className-="flex">
          <div className="flex font-semibold justify-center space-x-16 my-4 text-neutral-500">
            <div>Bites</div>
            <div>Following</div>
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
                className="h-10 bg-neutral-900 hover:bg-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 border border-neutral-700 rounded-xl text-white"
              >
                {loading ? "Posting..." : "Post"}
              </button>
            </div>
            <Feed />
          </div>
        </div>
      </div>
    </>
  );
}
