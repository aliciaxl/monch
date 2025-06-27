import { useState } from "react";
import apiClient from "../api/apiClient.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { formatDistanceToNow, format } from "date-fns";
import { Link } from "react-router-dom";

export default function Post({ post }) {
  const [liked, setLiked] = useState(post.liked_by_user || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [loading, setLoading] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replies, setReplies] = useState(post.replies || []);

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

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await apiClient.post(
        `/posts/`,
        {
          content: replyText.trim(),
          parent_post: post.id,
        },
        { withCredentials: true }
      );

      // Add new reply to local state
      setReplies((prev) => [...prev, res.data]);
      setReplyText("");
      setShowReplyBox(false);

      // Optional callback for parent component
      if (onNewReply) onNewReply(res.data);
    } catch (error) {
      alert(
        error.response?.data?.detail ||
          error.message ||
          "Failed to submit reply"
      );
    } finally {
      setSubmittingReply(false);
    }
  };

  const formatPostedDate = (dateString) => {
    const date = new Date(dateString);
    const diffInDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);

    if (diffInDays > 6) {
      return format(date, 'MMM d');
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };

  return (
    <>

    {/* Original Post */}
    <div className="flex flex-col w-full border-b border-neutral-800 px-6 py-4 bg-neutral-900">
      <div className="flex items-start">

         {/* OP Avatar */}
        <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-semibold mr-4">
          {post.user[0]?.toUpperCase()}
        </div>
        <div className="flex-1">

           {/* OP Display Name / Time Posted */}
          <div className="flex text-sm text-neutral-400 mb-1">
            <Link
              to={`/user/${post.user}`}
              className="font-semibold text-white mr-2 hover:underline"
            >
              {post.user}
            </Link>
            {formatPostedDate(post.created_at)}
          </div>
          <div className="text-white text-base text-left mb-2">{post.content.trim()}</div>
          <div className="flex space-x-24 text-sm text-neutral-400">
            <button
              onClick={toggleLike}
              disabled={loading}
              className={`cursor-pointer flex items-center space-x-1 ${
                liked ? "text-red-500" : "hover:text-white"
              }`}
              aria-label={liked ? "Unlike post" : "Like post"}
            >
              <FontAwesomeIcon icon={faHeart} />
              <span className={likesCount === 0 ? "invisible" : ""}>{likesCount || 0}</span>
            </button>

            <button
              onClick={() => setShowReplyBox((show) => !show)}
              className="hover:text-white cursor-pointer flex items-center space-x-1"
              aria-expanded={showReplyBox}
              aria-controls={`reply-section-${post.id}`}
            >
              <FontAwesomeIcon icon={faCommentDots} />
              {post.replies_count > 0 && (
                <span className="text-neutral-400 text-sm">{post.replies_count}</span>
              )}
              <span className="sr-only">Toggle reply box</span>
            </button>
            <button
              onClick={() => setShowReplyBox((show) => !show)}
              className="hover:text-white cursor-pointer flex items-center space-x-1"
              aria-expanded={showReplyBox}
              aria-controls={`reply-section-${post.id}`}
            >
              <FontAwesomeIcon icon={faCommentDots} />
              {post.replies_count > 0 && (
                <span className="text-neutral-400 text-sm">{post.replies_count}</span>
              )}
              <span className="sr-only">Toggle reply box</span>
            </button>
            <button
              onClick={() => setShowReplyBox((show) => !show)}
              className="hover:text-white cursor-pointer flex items-center space-x-1"
              aria-expanded={showReplyBox}
              aria-controls={`reply-section-${post.id}`}
            >
              <FontAwesomeIcon icon={faCommentDots} />
              {post.replies_count > 0 && (
                <span className="text-neutral-400 text-sm">{post.replies_count}</span>
              )}
              <span className="sr-only">Toggle reply box</span>
            </button>
          </div>
        </div>
      </div>
    </div>

          {/* Reply section */}
          {showReplyBox && (
            <div
              id={`reply-section-${post.id}`}
              className="mt-4 border-t border-neutral-700 pt-4 space-y-4"
            >
              {/* Avatar + reply box side-by-side */}
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-semibold">
                  {/* Replace 'U' with actual user initial if you have access to current user info */}
                  U
                </div>
                <textarea
                  rows={3}
                  placeholder="Write your reply..."
                  className="w-full rounded bg-neutral-800 text-white p-2 resize-none"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={submittingReply}
                />
              </div>

              <div className="pl-14">
                <button
                  onClick={handleReplySubmit}
                  disabled={submittingReply || !replyText.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingReply ? "Submitting..." : "Reply"}
                </button>
              </div>

              {/* Replies list */}
              {replies.length > 0 && (
                <div className="space-y-4 mt-4 pl-4 border-l border-neutral-700">
                  {replies.map((reply) => (
                    <Post key={reply.id} post={reply} />
                  ))}
                </div>
              )}
            </div>
          )}
          </>
  );
}