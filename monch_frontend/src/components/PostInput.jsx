import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-regular-svg-icons";
import { faFaceSmile } from "@fortawesome/free-solid-svg-icons";
import { useRef, useState } from "react";
import { MyEmojiPicker } from "./EmojiPicker";

const MAX_FILE_SIZE_MB = 5;

export default function PostInput({
  newPost,
  setNewPost,
  handlePost,
  loading,
  media,
  setMedia,
  mediaPreview,
  setMediaPreview,
}) {
  const [mediaError, setMediaError] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const fileInputRef = useRef();

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

  const removeMedia = () => {
    setMedia(null);
    setMediaPreview(null);
    setMediaError(null);
  };

  const onEmojiClick = (emojiData) => {
  setNewPost((prev) => prev + emojiData.emoji);
  setShowPicker(false);
};

  return (
    <div className="flex flex-col items-start border-b border-neutral-800 bg-neutral-900 px-8 pb-4">
      <textarea
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        placeholder="What's on your mind?"
        rows={1}
        maxLength={500}
        className="focus:outline-none focus:ring-0 h-12 w-full resize-none rounded-md bg-neutral-900 text-white px-2 pt-2"
      />
      {mediaError && (
        <p className="text-red-500 text-xs ml-2 mt-2">{mediaError}</p>
      )}
      {mediaPreview && !mediaError && (
        <div className="relative ml-2 mt-4 my-6 inline-block">
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

      <div className="flex justify-between w-full pb-2">
        <div className="flex items-center gap-12 pl-2">
          <label className="cursor-pointer inline-block relative text-neutral-400 hover:text-white text-lg">
            <FontAwesomeIcon icon={faImage} />
            <input
              type="file"
              accept="image/*,.gif"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
          </label>
          <div className="relative inline-block">
            <FontAwesomeIcon
              icon={faFaceSmile}
              className="text-neutral-400 hover:text-white text-lg cursor-pointer"
              onClick={() => setShowPicker((prev) => !prev)}
            />

            {showPicker && (
              <div className="picker-container absolute left-0 mt-2">
                <MyEmojiPicker
                  onEmojiClick={onEmojiClick}
                />
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => handlePost(null, media)}
          disabled={loading || !newPost.trim()}
          className="transform transition-transform active:scale-[.95] duration-150 h-10 bg-neutral-900 hover:bg-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-4 border border-neutral-700 rounded-xl text-white"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}
