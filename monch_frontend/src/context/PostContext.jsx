import { createContext, useContext, useState } from "react";
import apiClient from "../api/apiClient.js"; // adjust the import path as needed

const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [postsNeedRefresh, setPostsNeedRefresh] = useState(false);
  const [loading, setLoading] = useState(false);

  // handlePost function moved here
  const handlePost = async ({ content, parentPostId = null, media = null }) => {
    const hasContent = content && content.trim().length > 0;
    if (!hasContent && !media) return;

    setLoading(true);
    const formData = new FormData();
    if (content) formData.append("content", content); // Only append content if it's not empty
    if (parentPostId) formData.append("parent_post_id", parentPostId);
    if (media) formData.append("media", media);

    try {
      const res = await apiClient.post("/posts/", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Trigger refresh globally
      setPostsNeedRefresh(true);
      return res.data; // Return new post data if needed
    } catch (err) {
      alert(err.message || "Failed to post");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PostContext.Provider
      value={{
        postsNeedRefresh,
        setPostsNeedRefresh,
        handlePost,
        loading,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePostContext = () => useContext(PostContext);
