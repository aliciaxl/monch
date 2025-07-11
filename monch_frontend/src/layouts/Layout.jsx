import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import PostModal from "../components/PostModal";
import { useState } from "react";
import apiClient from "../api/apiClient.js";

export default function Layout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  // Post submission logic
  const handlePost = async (parentPostId = null, mediaFile = null) => {
    if (!newPost.trim()) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("content", newPost);
    if (parentPostId) {
      formData.append("parent_post_id", parentPostId);
    }
    if (mediaFile) {
      formData.append("media", mediaFile);
    }

    try {
      const res = await apiClient.post("/posts/", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setNewPost("");
      setMedia(null);
      setMediaPreview(null);
      setIsModalOpen(false);

    } catch (err) {
      alert(err.message || "Failed to post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full text-white">
      <Sidebar onOpenPostModal={() => setIsModalOpen(true)} />
      <div className="flex-1 sm:ml-20 pt-12 md:ml-20">
        <Outlet context={{
          newPost,
          setNewPost,
          loading,
          setLoading,
          media,
          setMedia,
          mediaPreview,
          setMediaPreview,
          handlePost,
        }} />
      </div>

      <PostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        newPost={newPost}
        setNewPost={setNewPost}
        loading={loading}
        handlePost={handlePost}
        media={media}
        setMedia={setMedia}
        mediaPreview={mediaPreview}
        setMediaPreview={setMediaPreview}
      />
    </div>
  );
}
