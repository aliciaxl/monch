import { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

export default function EditProfile({ user, onClose, onSave }) {
  console.log("EditProfile user prop:", user);
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    avatarUrl: "",
  });

  // For previewing a newly selected avatar file before saving
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);

  // Initialize state when `user` is available
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.display_name || "",
        bio: user.bio || "",
        avatarUrl: user.avatar_url || "",
      });
      setPreviewUrl(user.avatar_url || "");
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // When user clicks avatar circle, open file selector
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file input change, generate preview URL
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type/size here if needed

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    // Optional: you might want to store the file itself instead of URL,
    // but for now updating avatarUrl with preview is ok for UI
    setFormData((prev) => ({ ...prev, avatarUrl: localUrl }));

    // TODO: Handle file upload to backend/cloud on form submit
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted:", formData); // 🔍 check here
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="relative pt-8 px-8 pb-16 rounded-xl w-full max-w-md shadow-lg border border-neutral-900 bg-neutral-900 flex flex-col">
        <button
          type="button"
          onClick={onClose}
          className="self-end px-4 text-white text-base hover:cursor-pointer focus:outline-none"
          aria-label="Close modal"
        >
          &#x2715;
        </button>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center p-2"
        >
          <div
            className="relative w-24 h-24 mb-6 cursor-pointer rounded-full overflow-hidden"
            onClick={handleAvatarClick}
            title="Click to upload avatar"
          >
            {/* Avatar image or letter */}
            <div className="w-full h-full bg-neutral-800 text-white flex items-center justify-center text-3xl font-semibold">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.username?.[0]?.toUpperCase() || "?"
              )}
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-white bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full">         
                 <FontAwesomeIcon icon={faCamera} className="text-black text-2xl" />
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,video/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Display Name */}
          <div className="relative z-0 w-full mb-6 group">
            <input
              type="text"
              name="displayName"
              maxLength={30}
              value={formData.displayName}
              onChange={handleChange}
              required
              className="px-2.5 pb-2.5 py-4 w-full text-sm text-white bg-transparent border border-neutral-800 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-white peer"
              placeholder=" "
            />
            <label
              htmlFor="displayName"
              className={`pointer-events-none absolute text-sm duration-300 transform scale-75 left-2 z-10 origin-[0] bg-neutral-900 px-2
    ${
      formData.displayName
        ? "text-white -translate-y-4 top-2 scale-75 left-2"
        : "text-gray-400 top-1/2 -translate-y-1/2 scale-100"
    }
    peer-focus:text-white peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2 peer-focus:left-2`}
            >
              Display Name
            </label>
          </div>

          {/* Bio */}
          <div className="relative z-0 w-full mb-6 group">
            <textarea
              name="bio"
              maxLength={150}
              value={formData.bio}
              onChange={handleChange}
              rows={1}
              className="block px-2.5 pb-2.5 py-4 w-full text-sm text-white bg-transparent border border-neutral-800 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-white peer resize-none field-sizing-content"
              placeholder=" "
            />
            <label
              htmlFor="bio"
              className={`pointer-events-none absolute text-sm duration-300 transform scale-75 left-2 z-10 origin-[0] bg-neutral-900 px-2
    ${
      formData.bio
        ? "text-white -translate-y-4 top-2 scale-75 left-2"
        : "text-gray-400 top-1/2 -translate-y-1/2 scale-100"
    }
    peer-focus:text-white peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2 peer-focus:left-2`}
            >
              Bio
            </label>
          </div>

          {/* Avatar URL */}
          <div className="relative z-0 w-full mb-6 group">
            <input
              type="text"
              name="avatarUrl"
              value={formData.avatarUrl}
              onChange={handleChange}
              className="block px-2.5 pb-2.5 py-4 w-full text-sm text-white bg-transparent border border-neutral-800 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-white peer"
              placeholder=" "
            />
            <label
              htmlFor="avatarUrl"
              className={`pointer-events-none absolute text-sm duration-300 transform scale-75 left-2 z-10 origin-[0] bg-neutral-900 px-2
    ${
      formData.avatarUrl
        ? "text-white -translate-y-4 top-2 scale-75 left-2"
        : "text-gray-400 top-1/2 -translate-y-1/2 scale-100"
    }
    peer-focus:text-white peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2 peer-focus:left-2`}
            >
              Avatar URL
            </label>
          </div>

          <button
            type="submit"
            className="transform transition-transform active:scale-[.95] duration-150 text-[15px] w-full bg-white font-semibold p-3 rounded-xl mt-4 text-black hover:bg-neutral-100 cursor-pointer"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
