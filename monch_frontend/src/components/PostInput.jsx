import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-regular-svg-icons";
import { faFaceSmile } from "@fortawesome/free-solid-svg-icons";
import { useRef, useEffect, useState } from "react";
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
  const textareaRef = useRef();

  const pickerRef = useRef(null);
  const emojiButtonRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowPicker(false);
      }
    }

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  const handleTextareaChange = (e) => {
    setNewPost(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
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

  const removeMedia = () => {
    setMedia(null);
    setMediaPreview(null);
    setMediaError(null);
  };

  const onEmojiClick = (emojiData) => {
    setNewPost((prev) => prev + emojiData.emoji);
    setShowPicker(false);
  };

  function Spinner() {
    return (
      <div className="flex justify-center ml-2">
        <div
          className="animate-spin inline-block w-4 h-4 border-2 border-neutral-500 border-t-transparent rounded-full"
          role="status"
          aria-label="loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full items-start rounded-xl border-neutral-800 bg-neutral-900 px-8 pb-4">
      <textarea
        ref={textareaRef}
        value={newPost}
        onChange={handleTextareaChange}
        placeholder="What's on your mind?"
        rows={1}
        maxLength={500}
        className="min-h-[3rem] focus:outline-none focus:ring-0 h-12 w-full resize-none rounded-md bg-neutral-900 text-white px-2 pt-1"
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

      <div className="flex justify-between w-full pb-2 mt-1">
        <div className="flex items-center gap-12 pl-2">
          <div className="relative">
            <label htmlFor="file-upload" className="cursor-pointer">
              <FontAwesomeIcon
                icon={faImage}
                className="text-neutral-400 hover:text-white text-lg"
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
              className="text-neutral-400 hover:text-white text-lg cursor-pointer"
              onClick={() => setShowPicker((prev) => !prev)}
              ref={emojiButtonRef}
            />

            {showPicker && (
              <div
                ref={pickerRef}
                className="picker-container absolute left-0 mt-2"
              >
                <MyEmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => handlePost(null, media)}
          disabled={loading || !newPost.trim()}
          className="transform transition-transform active:scale-[.95] duration-150 h-10 bg-neutral-900 hover:bg-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-4 border border-neutral-700 rounded-xl text-white flex justify-center items-center"
        >
          {loading ? (
            <>
              Posting...
              <Spinner />
            </>
          ) : (
            "Post"
          )}
        </button>
      </div>
    </div>
  );
}
