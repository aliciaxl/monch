import { useEffect, useState } from "react";
import { usePostContext } from "../context/PostContext";
import apiClient from "../api/apiClient.js";
import PostInput from "../components/PostInput";
import Feed from "../components/Feed";
import { useParams, useNavigate } from "react-router-dom";

export default function Home() {
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState([]);
  const { postsNeedRefresh, setPostsNeedRefresh, handlePost, loading } = usePostContext();
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const { tab: paramTab } = useParams();
  const tab = paramTab === "following" ? "following" : "bites"; 
  const navigate = useNavigate();

  const fetchPosts = async () => {
    const endpoint = tab === "following" ? "/posts/following/" : "/posts/";
    try {
      const res = await apiClient.get(endpoint, { withCredentials: true });
      setPosts(res.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [tab]);

  useEffect(() => {
    if (postsNeedRefresh) {
      fetchPosts();
      setPostsNeedRefresh(false);
    }
  }, [postsNeedRefresh]);

  const onSubmit = async () => {
    if (!newPost.trim()) return;
    try {
      await handlePost({ content: newPost, media });
      setNewPost("");
      setMedia(null);
      setMediaPreview(null);
    } catch (err) {

    }
  };

  return (
    <div className="flex h-screen w-full text-white">
      <div className="flex flex-col">
        {/* Tabs */}
        <div className="flex text-m font-semibold justify-center text-neutral-500">
          <button
            onClick={() => navigate("/home/bites")}
            className={`w-32 py-4 text-center cursor-pointer border-b ${
              tab === "bites"
                ? "text-white border-neutral-300"
                : "border-transparent hover:text-white"
            }`}
          >
            Bites
          </button>
          <button
            onClick={() => navigate("/home/following")}
            className={`w-32 py-4 text-center cursor-pointer border-b ${
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
            handlePost={onSubmit} 
            loading={loading}      
            media={media}
            setMedia={setMedia}
            mediaPreview={mediaPreview}
            setMediaPreview={setMediaPreview}
          />
          <Feed posts={posts} />
        </div>
      </div>
    </div>
  );
}
