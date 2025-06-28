import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient.js";
import Post from "./Post.jsx";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faCommentDots,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

export default function PostDetail() {
  const { user } = useAuth();
  const currentUser = user?.username;
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      try {
        const res = await apiClient.get(`/posts/${postId}`, {
          withCredentials: true,
        });
        console.log("Post data:", res.data);
        setPost(res.data);
        setReplies(res.data.replies || []);
        setLiked(res.data.liked_by_user || false);
        setLikesCount(res.data.likes || 0);
      } catch (error) {
        alert("Failed to load post");
        setPost(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [postId]);

  const toggleLike = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (!liked) {
        await apiClient.post(`/posts/${post.id}/like/`, null, {
          withCredentials: true,
        });
        setLiked(true);
        setLikesCount((count) => count + 1);
      } else {
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

  const handleInput = (e) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
    setReplyText(e.target.value);
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await apiClient.post(
        `/posts/`,
        {
          content: replyText.trim(),
          parent_post: postId,
        },
        { withCredentials: true }
      );
      setReplies((prev) => [...prev, res.data]);
      setReplyText("");
    } catch (error) {
      alert("Failed to submit reply");
    } finally {
      setSubmitting(false);
    }
  };

  const formatPostedDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "EEEE MMMM d, yyyy 'at' h:mm a");
  };

  if (loading) return <div className="text-white p-6">Loading...</div>;
  if (!post) return <div className="text-white p-6">Post not found.</div>;

  return (
    <div className="flex-1 flex-col justify-center w-160 items-center border-neutral-800 bg-neutral-900">
      <div className="bg-neutral-900 min-h-screen text-white">
        <div className="py-6 px-8 border-b border-neutral-800">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="text-white hover:text-gray-300 cursor-pointer flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        </div>

        {/* Original Post */}
        <div className="parent-post">
          <div className="relative z-10 flex flex-col w-full border-b border-neutral-800 px-6 py-6 bg-neutral-900">
            {/* Top row: Avatar + Username */}
            <div className="flex items-start mb-2">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-semibold mr-4">
                {post.user.username[0]?.toUpperCase()}
              </div>

              {/* Username */}
              <div className="flex flex-col items-start justify-center">
                <span className="font-semibold text-white">
                  {post.user.display_name
                    ? post.user.display_name
                    : post.user.username}
                </span>
                <Link
                  to={`/user/${post.user.username}`}
                  className="text-neutral-500"
                >
                  @{post.user.username}
                </Link>
              </div>
            </div>

            {/* Post content */}
            <div className="text-white text-lg my-3 text-left">
              {post.content.trim()}
            </div>

            <div className="w-full border-b border-neutral-800">
              {/* Post date */}
              <div className="w-full text-neutral-600 mt-4 mb-4 text-left">
                {formatPostedDate(post.created_at)}
              </div>
            </div>

            <div className="w-full text text-neutral-600 py-4 text-left flex space-x-6 border-b border-neutral-800">
              <span>
                <strong className="font-semibold text-white">
                  {likesCount}
                </strong>{" "}
                {likesCount === 1 ? "Like" : "Likes"}
              </span>
              <span>
                <strong className="font-semibold text-white">
                  {post.replies_count}
                </strong>{" "}
                {post.replies_count === 1 ? "Reply" : "Replies"}
              </span>
            </div>

            {/* Buttons */}
            <div className="flex w-full justify-between text-sm pt-6 px-12 text-neutral-400">
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
            </div>
          </div>
        </div>

        {/* Reply Section */}
        <div
          id={`reply-section-${post.id}`}
          className="mt-6 border-neutral-700"
        >
          <div className="text-xs text-left ml-21 text-neutral-400 mb-1">
            Replying to{" "}
            <Link
              to={`/user/${post.user.username}`}
              className="font-semibold text-white mr-2"
            >
              @{post.user.username}
            </Link>
          </div>

          {/* Avatar + reply box side-by-side */}
          <div className="flex w-full border-b border-neutral-800 items-start px-6 bg-neutral-900 space-x-4">
            <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-semibold">
              {currentUser?.[0]?.toUpperCase() || "U"}
            </div>

            <div className="flex flex-col w-full">
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder="Write your reply..."
                className="w-full text-white p-2 resize-none border-b border-neutral-800 focus:outline-none overflow-hidden"
                value={replyText}
                onChange={handleInput}
                disabled={submitting}
              />
              <div className="my-4 flex justify-end">
                <button
                  onClick={handleReplySubmit}
                  disabled={submitting || !replyText.trim()}
                  className="h-10 bg-neutral-900 hover:bg-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-4 border border-neutral-700 rounded-xl text-white"
                >
                  {submitting ? "Submitting..." : "Reply"}
                </button>
              </div>
            </div>
          </div>

          {/* Replies List */}
          {replies.length > 0 && (
            <div className="space-y-4 border-l border-neutral-700">
              {replies.map((reply) => (
                <Post key={reply.id} post={reply} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
