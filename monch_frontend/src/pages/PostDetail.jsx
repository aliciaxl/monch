import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient.js";
import Post from "../components/Post.jsx";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faCopy } from "@fortawesome/free-regular-svg-icons";
import {
  faHeart,
  faCommentDots,
  faArrowLeft,
  faFaceSmile,
  faRetweet,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { MyEmojiPicker } from "../components/EmojiPicker.jsx";
import toast from "react-hot-toast";
import ConfirmDialog from "../popups/ConfirmDialog.jsx";
import Spinner from "../components/Spinner.jsx";

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

  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaError, setMediaError] = useState("");
  const fileInputRef = useRef(null);

  const [reposted, setReposted] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isOwner = currentUser === post?.user?.username;

  const [fadeIn, setFadeIn] = useState(false);

  const MAX_FILE_SIZE_MB = 5;

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      try {
        const res = await apiClient.get(`/posts/${postId}`, {
          withCredentials: true,
        });
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

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setFadeIn(true), 50);
      return () => clearTimeout(timer);
    } else {
      setFadeIn(false);
    }
  }, [loading]);

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

    const formData = new FormData();
    formData.append("content", replyText.trim());
    formData.append("parent_post", postId);
    if (media) formData.append("media", media);

    try {
      const res = await apiClient.post("/posts/", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setReplies((prev) => [res.data, ...prev]);
      setReplyText("");
      setMedia(null);
      setMediaPreview(null);
      setMediaError("");
    } catch (error) {
      alert("Failed to submit reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setMedia(null);
      setMediaPreview(null);
      setMediaError("Only JPEG, PNG, and GIF files are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setMedia(null);
      setMediaPreview(null);
      setMediaError("File exceeds 5MB size limit.");
      return;
    }

    setMedia(file);
    setMediaPreview(URL.createObjectURL(file));
    setMediaError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatPostedDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "EEEE MMMM d, yyyy 'at' h:mm a");
  };

  const repost = async () => {
    const formData = new FormData();
    formData.append("repost_of", post.id);
    formData.append("content", post.content);

    try {
      await apiClient.post("/posts/", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Successfully reposted!");
      setReposted(true);
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Failed to repost. Please try again."
      );
    }
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaPreview(null);
    setMediaError(null);
  };

  const onEmojiClick = (emojiData) => {
    setReplyText((prev) => prev + emojiData.emoji);
    setShowPicker(false);
  };

  return (
    <div className="home flex flex-col flex-grow w-full h-full text-whitesm:px-0">
      <div className="flex flex-col flex-1 w-full mx-auto">
        <div className="flex flex-grow flex-col w-full min-w-full border-neutral-800 bg-neutral-900">
          <div className="bg-neutral-900 min-h-screen text-white relative">
            {/* Always render this outer container, even while loading */}
            <div className="py-6 px-8 border-b border-neutral-800">
              <button
                onClick={() => navigate(-1)}
                aria-label="Go back"
                className="text-white hover:text-gray-300 cursor-pointer flex items-center space-x-2"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
            </div>

            {loading ? (
              // Spinner in the center
              <div className="flex justify-center items-center h-[60vh]">
                <Spinner />
              </div>
            ) : post ? (
              <div
                className={`transition-opacity duration-700 ease-in-out ${
                  fadeIn ? "opacity-100" : "opacity-0"
                }`}
              >
                <>
                  {/* Original Post */}
                  <div className="parent-post">
                    <div className="relative z-10 flex flex-col w-full border-b border-neutral-800 px-6 py-6 bg-neutral-900">
                      {isOwner && (
                        <button
                          onClick={() => setIsDialogOpen(true)}
                          className="flex flex-col z-20 w-full text-neutral-700 text-sm items-end"
                        >
                          <FontAwesomeIcon
                            icon={faXmark}
                            className="text-sm hover:text-white cursor-pointer p-2 -m-2"
                          />
                        </button>
                      )}
                      {/* Top row: Avatar + Username */}

                      <div className="flex items-start mb-2">
                        <Link
                          to={`/user/${post.user.username}`}
                          className="text-neutral-500"
                        >
                          <div className="self-start flex-none w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-semibold overflow-hidden mr-4">
                            {post.user.avatar ? (
                              <img
                                src={post.user.avatar}
                                alt="Avatar"
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span>
                                {post.user.username[0]?.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </Link>
                        <Link
                          to={`/user/${post.user.username}`}
                          className="text-neutral-500"
                        >
                          {/* Username */}
                          <div className="flex flex-col items-start justify-center">
                            <span className="font-semibold text-white">
                              {post.user.display_name
                                ? post.user.display_name
                                : post.user.username}
                            </span>
                            @{post.user.username}
                          </div>
                        </Link>
                      </div>

                      {/* Post content */}
                      <div className="text-white my-3 text-left">
                        {post.content.trim()}
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
                                className="max-w-full my-2 rounded-xl object-cover"
                              />
                            </a>
                          ))}
                        </div>
                      )}

                      <div className="w-full border-b border-neutral-800">
                        {/* Post date */}
                        <div className="w-full text-neutral-600 mt-4 mb-4 text-left">
                          {formatPostedDate(post.created_at)}
                        </div>
                      </div>

                      {/* Like and Reply counts */}
                      <div className="w-full text text-neutral-600 py-4 text-left flex space-x-6 border-b border-neutral-800">
                        <span>
                          <span className="font text-neutral-300">
                            {likesCount}
                          </span>{" "}
                          {likesCount === 1 ? "Like" : "Likes"}
                        </span>
                        <span>
                          <span className="font text-neutral-300">
                            {post.replies_count}
                          </span>{" "}
                          {post.replies_count === 1 ? "Reply" : "Replies"}
                        </span>
                      </div>

                      {/* Buttons */}
                      <div className="flex w-full text-sm pt-6 justify-around text-neutral-400">
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
                            {post.replies_count > 0
                              ? post.replies_count
                              : "\u00A0"}
                          </span>
                        </button>
                        {/* Repost */}
                        <button
                          onClick={repost}
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
                          <span className="sr-only">
                            Copy post link to clipboard
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
                      <div className="self-start flex-none w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-semibold overflow-hidden">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt="Your Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{user.username?.[0]?.toUpperCase()}</span>
                        )}
                      </div>

                      <div className="flex flex-col w-full">
                        <textarea
                          ref={textareaRef}
                          rows={1}
                          placeholder="Write your reply..."
                          className="w-full text-white p-2 resize-none focus:outline-none overflow-hidden"
                          value={replyText}
                          onChange={handleInput}
                          disabled={submitting}
                        />
                        {mediaError && (
                          <p className="text-red-500 text-left text-xs ml-2 mt-1">
                            {mediaError}
                          </p>
                        )}
                        {mediaPreview && !mediaError && (
                          <div className="relative w-fit my-2 inline-block">
                            <img
                              src={mediaPreview}
                              alt="preview"
                              className="max-h-80 rounded-lg border border-neutral-800"
                            />
                            <button
                              onClick={removeMedia}
                              className="absolute top-1 right-2 bg-opacity-70 text-neutral-700 cursor-pointer rounded-full p-1 font-bold text-xs hover:bg-opacity-100"
                              aria-label="Remove image"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                        <div className="flex justify-between w-full pb-4">
                          <div className="flex items-center gap-12 pl-2">
                            <div className="relative">
                              <label
                                htmlFor="file-upload"
                                className="cursor-pointer"
                              >
                                <FontAwesomeIcon
                                  icon={faImage}
                                  className="text-neutral-400 hover:text-white text-md"
                                />
                              </label>
                              <input
                                id="file-upload"
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,.gif"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                            </div>
                            <div className="relative inline-block">
                              <FontAwesomeIcon
                                icon={faFaceSmile}
                                className="text-neutral-400 hover:text-white text-md cursor-pointer"
                                onClick={() => setShowPicker((prev) => !prev)}
                              />
                              {showPicker && (
                                <div className="picker-container absolute left-0 mt-2 z-20">
                                  <MyEmojiPicker onEmojiClick={onEmojiClick} />
                                </div>
                              )}
                            </div>
                          </div>
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
                      <div className="border-l border-neutral-700">
                        {replies.map((reply) => (
                          <Post key={reply.id} post={reply} />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              </div>
            ) : (
              <div className="text-white p-6">Post not found.</div>
            )}

            <ConfirmDialog
              open={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              onConfirm={async () => {
                await apiClient.delete(`/posts/${post.id}/`, {
                  withCredentials: true,
                });
                toast.success("Post deleted");
                setIsDialogOpen(false);
                navigate(-1); // or redirect to feed
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
