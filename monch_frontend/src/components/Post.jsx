import { useState, useEffect } from "react";
import apiClient from "../api/apiClient.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

export default function Post({ post }) {
    const [liked, setLiked] = useState(post.liked_by_user || false);
    const [likesCount, setLikesCount] = useState(post.likes || 0);
    const [loading, setLoading] = useState(false);

const toggleLike = async () => {
  if (loading) return; // prevent double clicks while processing
  setLoading(true);

  try {
    if (!liked) {
      // Add like (POST)
      await apiClient.post(`/posts/${post.id}/like/`, null, { withCredentials: true });
      setLiked(true);
      setLikesCount((count) => count + 1);
    } else {
      // Remove like (DELETE)
      await apiClient.delete(`/posts/${post.id}/like/`, { withCredentials: true });
      setLiked(false);
      setLikesCount((count) => count - 1);
    }
  } catch (error) {
    alert(error.response?.data?.detail || error.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex items-start w-full border-b border-neutral-800 px-6 p-4 bg-neutral-900">
      <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-semibold mr-4">
        {post.user[0]?.toUpperCase()}
      </div>
      <div>
        <div className="flex text-sm text-neutral-400 mb-1">
          <Link to={`/user/${post.user}`} className="font-semibold text-white mr-2 hover:underline">
            {post.user}
          </Link>
          {formatDistanceToNow(new Date(post.created_at), {
            addSuffix: true,
          })}
        </div>
        <div className="flex flex-start text-white text-base">
          {post.content.trim()}
        </div>
        <div className="flex space-x-4 mt-2 text-sm text-neutral-400">
          <button
            onClick={toggleLike}
            disabled={loading}
            className={`cursor-pointer flex items-center space-x-1 mr-8 ${
              liked ? "text-red-500" : "hover:text-white"
            }`}
            aria-label={liked ? "Unlike post" : "Like post"}
          >
            <FontAwesomeIcon icon={faHeart} />
            <span className={likesCount === 0 ? "invisible" : ""}>
                {likesCount || 0}
            </span>
          </button>
          <button className="hover:text-white cursor-pointer flex items-center space-x-1">
            <FontAwesomeIcon icon={faCommentDots} />
            {post.replies_count > 0 && (
              <span className="text-neutral-400 text-sm">
                {post.replies_count}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
