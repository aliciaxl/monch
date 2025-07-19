import { useState, useRef } from "react";
import { usePostContext } from "../context/PostContext";
import apiClient from "../api/apiClient.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faCommentDots,
  faRetweet,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { formatDistanceToNow, format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ConfirmDialog from "../popups/ConfirmDialog.jsx";

export default function Post({
  post,
  isOwner = false,
  onPostDeleted,
  isReplyWithParent = false,
}) {
  const [liked, setLiked] = useState(post.liked_by_user || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [reposted, setReposted] = useState(!!post.user_repost_id);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setPostsNeedRefresh } = usePostContext();
  const navigate = useNavigate();

  const toggleLike = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (!liked) {
        // Add like
        await apiClient.post(`/posts/${post.id}/like/`, null, {
          withCredentials: true,
        });
        setLiked(true);
        setLikesCount((count) => count + 1);
      } else {
        // Remove like
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

  const toggleRepost = async () => {
  if (loading) return;
  setLoading(true);

  try {
    const res = await apiClient.post(`/posts/${post.id}/toggle_repost/`, null, {
      withCredentials: true,
    });

    if (res.data.reposted) {
      toast.success("Reposted!");
      setReposted(true);
    } else {
      toast.success("Repost removed.");
      setReposted(false);
    }

    setPostsNeedRefresh(true);
  } catch (err) {
    toast.error(err.response?.data?.detail || "Repost failed.");
  } finally {
    setLoading(false);
  }
};


  const handleDelete = async () => {
    try {
      await apiClient.delete(`/posts/${post.id}/`, {
        withCredentials: true,
      });
      if (onPostDeleted) onPostDeleted();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete post.");
    }
  };

  const postContainerClass = isReplyWithParent
  ? "flex flex-col w-full pl-18 px-6 pt-2 py-6 pr-12 bg-[#1d1d1d] relative border-l border-neutral-700"
  : "flex flex-col w-full border-b border-neutral-800 px-6 pt-4 py-6 bg-neutral-900";

  return (
    <>
      {isOwner && !isReplyWithParent && (
      <button
        onClick={() => setIsDialogOpen(true)}
        className="flex flex-col w-full text-neutral-700 text-sm items-end hover:text-white cursor-pointer pt-5 pr-5 -mb-8"
      >
        <FontAwesomeIcon icon={faXmark} className="text-xs" />
      </button>
    )}
      {/* Original Post */}
      <div className={postContainerClass}>
        {isReplyWithParent && (
        <img
          src="/icons/reply.png"
          alt="Reply arrow"
          className="absolute left-8 top-6 transform w-5 h-4"
        />
      )}
        {/* Repost note */}
        {post.repost_of_detail ? (
          <div className="text-xs text-neutral-400 flex items-center gap-1 -mb-1">
            <FontAwesomeIcon
              icon={faRetweet}
              className="text-neutral-400 pl-12"
            />
            <span>
              Bit from{" "}
              <Link
                to={`/user/${post.repost_of_detail.user.username}`}
                className="italic"
              >
                @{post.repost_of_detail.user.username}
              </Link>
            </span>
          </div>
        ) : null}
        <div className="flex items-start pt-2">
          {/* OP Avatar */}
          <div className="self-start flex-none w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-semibold overflow-hidden mr-4">
            {post.user.avatar ? (
              <img
                src={post.user.avatar}
                alt="Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span>
                {post.user.username[0]?.toUpperCase() || post.user.display_name?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            {/* OP Display Name / Time Posted */}
            <div className="flex text-base items-center text-neutral-400 mb-1">
              <Link
                to={`/user/${post.user.username}`}
                className="font-bold text-white mr-2"
              >
                {post.user.username}
              </Link>
              <div className="text-xs">{formatPostedDate(post.created_at)}</div>
            </div>

            {/* Text Content */}
            <div className="text-white text-left mt-1 mb-2">
              <Link to={`/post/${post.id}`} className="post-textcontent">
                {post.content.trim()}
              </Link>
            </div>

            {/* Post Media */}
            {post.media && post.media.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {post.media.map((mediaItem) => (
                  <a
                    key={mediaItem.id}
                    href={mediaItem.media_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={mediaItem.media_file}
                      alt=""
                      className="max-w-full my-2 rounded-md object-cover"
                    />
                  </a>
                ))}
              </div>
            )}

            {/* Buttons */}

            {/* Like */}
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

              {/* Replies */}
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

              {/* Repost */}
              <button
                onClick={toggleRepost}
                className={`hover:text-white cursor-pointer flex items-center space-x-1 ${
                  reposted ? "text-indigo-300" : "text-neutral-400"
                }`}
                aria-label="Repost"
              >
                <FontAwesomeIcon icon={faRetweet} />
                <span className="sr-only">Repost success</span>
              </button>

              {/* Copy to Clipboard */}
              <button
                onClick={() => {
                  const postUrl = `${window.location.origin}/post/${post.id}`;
                  navigator.clipboard
                    .writeText(postUrl)
                    .then(() => {
                      toast.success("Link copied to clipboard!");
                    })
                    .catch((err) => {
                      console.error("Failed to copy: ", err);
                    });
                }}
                className="hover:text-white cursor-pointer flex items-center space-x-1"
                aria-label="Copy post link to clipboard"
              >
                <FontAwesomeIcon icon={faCopy} />
                <span className="sr-only">Copy post link to clipboard</span>
              </button>

              <ConfirmDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onConfirm={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
