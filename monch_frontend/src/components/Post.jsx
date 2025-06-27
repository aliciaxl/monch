import { useState, useRef } from "react";
import apiClient from "../api/apiClient.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { formatDistanceToNow, format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Post({ post }) {
  const [liked, setLiked] = useState(post.liked_by_user || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  const toggleLike = async () => {
    if (loading) return; // prevent double clicks while processing
    setLoading(true);

    try {
      if (!liked) {
        // Add like (POST)
        await apiClient.post(`/posts/${post.id}/like/`, null, {
          withCredentials: true,
        });
        setLiked(true);
        setLikesCount((count) => count + 1);
      } else {
        // Remove like (DELETE)
        await apiClient.delete(`/posts/${post.id}/like/`, {
          withCredentials: true,
        });
        setLiked(false);
        setLikesCount((count) => count - 1);
      }
    } catch (error) {
      alert(
        error.response?.data?.detail || error.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPostedDate = (dateString) => {
    const date = new Date(dateString);
    const diffInDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);

    if (diffInDays > 6) {
      return format(date, "MMM d");
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };

  return (
    <>
      {/* Original Post */}
      <div className="flex flex-col w-full border-b border-neutral-800 px-6 py-6 bg-neutral-900">
        <div className="flex items-start">
          {/* OP Avatar */}
          <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-semibold mr-4">
            {post.user.username[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            {/* OP Display Name / Time Posted */}
            <div className="flex text-sm items-center text-neutral-400 mb-1">
              <Link
                to={`/user/${post.user.username}`}
                className="font-semibold text-white mr-2"
              >
                {post.user.username}
              </Link>
              <div className="text-xs">{formatPostedDate(post.created_at)}</div>
            </div>
            <div className="text-white text-base text-left my-2">
              <Link to={`/post/${post.id}`} className="hover:underline">
                {post.content.trim()}
              </Link>
            </div>

            {/* Buttons */}
            <div className="flex w-full justify-between text-sm mt-4 pr-12 text-neutral-400">
              <button
                onClick={toggleLike}
                disabled={loading}
                className={`cursor-pointer flex items-center space-x-1 ${
                  liked ? "text-red-500" : "hover:text-white"
                }`}
                aria-label={liked ? "Unlike post" : "Like post"}
              >
                <FontAwesomeIcon icon={faHeart} />
                <span className={likesCount === 0 ? "invisible" : ""}>
                  {likesCount || 0}
                </span>
              </button>

              <button
                onClick={() => navigate(`/post/${post.id}`)}
                className="hover:text-white cursor-pointer flex items-center space-x-1"
                aria-label="Go to post detail"
              >
                <FontAwesomeIcon icon={faCommentDots} />
                <span>
                  {post.replies_count > 0 ? post.replies_count : "\u00A0"}
                </span>
              </button>
              <button
                onClick={() => navigate(`/post/${post.id}`)}
                className="hover:text-white cursor-pointer flex items-center space-x-1"
                aria-label="Go to post detail"
              >
                <FontAwesomeIcon icon={faCommentDots} />
                <span>
                  {post.replies_count > 0 ? post.replies_count : "\u00A0"}
                </span>
                <span className="sr-only">View post and replies</span>
              </button>
              <button
                onClick={() => navigate(`/post/${post.id}`)}
                className="hover:text-white cursor-pointer flex items-center space-x-1"
                aria-label="Go to post detail"
              >
                <FontAwesomeIcon icon={faCommentDots} />
                <span>
                  {post.replies_count > 0 ? post.replies_count : "\u00A0"}
                </span>
                <span className="sr-only">View post and replies</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
