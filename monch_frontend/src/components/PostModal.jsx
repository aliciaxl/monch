import PostInput from "./PostInput";
import { useAuth } from "../context/AuthContext";

export default function PostModal({
  isOpen,
  onClose,
  newPost,
  setNewPost,
  handlePost,
  loading,
  media,
  setMedia,
  mediaPreview,
  setMediaPreview,
}) {
  const { user } = useAuth();

  const handleClose = () => {
  setNewPost("");           // clear post input
  setMedia(null);           // clear selected media (if applicable)
  setMediaPreview(null);    // clear media preview (if applicable)
  onClose();                // trigger the parent's close behavior
};

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-neutral-800/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleClose} // Close modal if clicking outside
    >
      <div
        className="w-160 rounded-xl border-[0.5px] border-neutral-700 bg-neutral-900 text-white shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="relative flex items-center py-4 px-4 border-b-[0.5px] border-neutral-700">
          <h2 className="absolute left-1/2 transform -translate-x-1/2 font-semibold text-base">
            Create Post
          </h2>
          <button
            onClick={handleClose}
            className="ml-auto text-neutral-700 hover:text-white text-sm cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* User info section */}
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

        <div className="">
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
        </div>
      </div>
    </div>
  );
}
