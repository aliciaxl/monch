import { useEffect, useState } from "react";
import apiClient from "../api/apiClient.js";
import PostInput from "../components/PostInput";
import Feed from "../components/Feed";
import { useParams, useNavigate } from "react-router-dom";

export default function Home() {
  const { tab: paramTab } = useParams();
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [tab, setTab] = useState(
    paramTab === "following" ? "following" : "bites"
  );
  const navigate = useNavigate();

  useEffect(() => {
    setTab(paramTab === "following" ? "following" : "bites");
  }, [paramTab]);

  useEffect(() => {
    const endpoint = paramTab === "following" ? "/posts/following/" : "/posts/";

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

  const handlePost = async (parentPostId = null, media = null) => {
    if (!newPost.trim()) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("content", newPost);
    if (parentPostId) {
      formData.append("parent_post_id", parentPostId);
    }
    if (media) {
      console.log("Adding media: ", media);
      formData.append("media", media);
    }

    try {
      const res = await apiClient.post("/posts/", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Post response:", res);
      setPosts((prev) => [res.data, ...prev]);
      setNewPost("");
      setMedia(null);            
      setMediaPreview(null); 
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
            handlePost={handlePost}
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
