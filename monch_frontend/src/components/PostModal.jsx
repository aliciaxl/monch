import { useState } from "react";
import PostInput from "./PostInput";
import { useAuth } from "../context/AuthContext";
import { usePostContext } from "../context/PostContext";

export default function PostModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { handlePost, loading } = usePostContext();

  const [newPost, setNewPost] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  const handleClose = () => {
    setNewPost("");
    setMedia(null);
    setMediaPreview(null);
    onClose();
  };

  const onSubmit = async () => {
    if (!newPost.trim()) return;

    try {
      // Call handlePost shared with Home
      await handlePost({ content: newPost, media });

      setNewPost("");
      setMedia(null);
      setMediaPreview(null);
      onClose();
    } catch (err) {
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="w-160 rounded-xl border-[0.5px] border-neutral-700 bg-neutral-900 text-white shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex items-center pt-4 pb-8 px-4 border-b-[0.5px] border-neutral-700">
          <button
            onClick={handleClose}
            className="ml-auto text-neutral-700 hover:text-white text-sm cursor-pointer -mt-1"
            aria-label="Close modal"
          >
            ✕
          </button>
          <h2 className="absolute left-1/2 transform -translate-x-1/2 font-semibold text-base mt-4">
            Create Post
          </h2>
        </div>

        {/* User info */}
        <div className="flex items-center px-10 py-4">
          <div className="flex-none w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center text-white text-xl font-semibold overflow-hidden mr-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span>
                {user?.display_name?.[0]?.toUpperCase() ||
                  user?.username?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm text-white">
              {user?.display_name || user?.username}
            </p>
            <p className="text-neutral-400 text-sm">@{user?.username}</p>
          </div>
        </div>

        {/* Post Input */}
        <div className="-mb-1">
          <PostInput
            newPost={newPost}
            setNewPost={setNewPost}
            handlePost={onSubmit}  // use the wrapper here
            loading={loading}      // from context
            media={media}
            setMedia={setMedia}
            mediaPreview={mediaPreview}
            setMediaPreview={setMediaPreview}
          />
        </div>
      </div>
    </div>
  );
}
