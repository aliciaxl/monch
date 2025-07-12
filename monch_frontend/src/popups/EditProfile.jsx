import { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

export default function EditProfile({ user, onClose, onSave }) {
  const [profileData, setProfileData] = useState({
    displayName: "",
    bio: "",
    avatarFile: null,
  });

  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);
  const [media, setMedia] = useState(null);
  const [mediaError, setMediaError] = useState("");
  const [displayNameError, setDisplayNameError] = useState("");

  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.display_name || "",
        bio: user.bio || "",
        avatarFile: user.avatar || "",
      });
      setPreviewUrl(user.avatar || "");
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "displayName") {
      if (value.trim() !== "") {
        setDisplayNameError("");
      }
    }
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Allowed file types
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    if (!allowedTypes.includes(file.type)) {
      setMedia(null);
      setPreviewUrl(null);
      setMediaError("Only JPEG, PNG, and GIF files are allowed");
      return;
    }

    const MAX_FILE_SIZE_MB = 5;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setMedia(null);
      setPreviewUrl(null);
      setMediaError("File exceeds 5MB size limit");
      return;
    }

    setMedia(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMediaError("");

    setProfileData((prev) => ({
      ...prev,
      avatarFile: URL.createObjectURL(file),
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!profileData.displayName.trim()) {
      setDisplayNameError("Display name is required");
      return;
    }

    setDisplayNameError("");

    const formData = new FormData();
    formData.append("display_name", profileData.displayName);
    formData.append("bio", profileData.bio);

    if (media) {
      formData.append("avatar", media);
    }

    onSave(formData);
    onClose();
  };

  const resetForm = () => {
    setProfileData({
      displayName: user?.display_name || "",
      bio: user?.bio || "",
      avatarFile: user?.avatar || null,
    });
    setPreviewUrl(user?.avatar || "");
    setMedia(null);
    setMediaError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-md flex justify-center items-center z-50"
      onMouseDown={handleClose}
    >
      <div
        className="relative pt-8 px-10 pb-16 rounded-xl w-full max-w-md border-[0.5px] border-neutral-700 bg-neutral-900 flex flex-col"
        onMouseDown={(e) => e.stopPropagation()} //Stops clicks inside modal from closing it
      >
        <button
          type="button"
          onClick={onClose}
          className="self-end px-4 text-neutral-700 hover:text-white text-base hover:cursor-pointer focus:outline-none"
          aria-label="Close modal"
        >
          &#x2715;
        </button>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center"
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
                user?.display_name?.[0]?.toUpperCase() || "?"
              )}
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-white bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full">
              <FontAwesomeIcon
                icon={faCamera}
                className="text-black text-2xl"
              />
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {mediaError && (
            <div className="text-red-500 text-xs mb-6">{mediaError}</div>
          )}

          {/* Display Name */}
          <div className="relative z-0 w-full mb-6 group">
            <input
              type="text"
              name="displayName"
              maxLength={30}
              value={profileData.displayName}
              onChange={handleChange}
              className="px-3 pb-2.5 py-4 w-full text-sm text-white bg-transparent border border-neutral-800 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-neutral-700 peer"
              placeholder=" "
            />
            <label
              htmlFor="displayName"
              className={`pointer-events-none absolute text-sm duration-300 transform scale-75 left-2 z-10 origin-[0] bg-neutral-900 px-2
    ${
      profileData.displayName
        ? "text-neutral-500 -translate-y-4 top-2 scale-75 left-2"
        : "text-neutral-400 top-1/2 -translate-y-1/2 scale-100"
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
              value={profileData.bio}
              onChange={handleChange}
              rows={3}
              className="block px-3 pb-2.5 py-4 w-full text-sm text-white bg-transparent border border-neutral-800 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-neutral-700 peer resize-none field-sizing-content min-h-24"
              placeholder=" "
            />
            <label
              htmlFor="bio"
              className={`pointer-events-none absolute text-sm duration-300 transform scale-75 left-2 z-10 origin-[0] bg-neutral-900 px-2
    ${
      profileData.bio
        ? "text-neutral-500 -translate-y-4 top-2 scale-75 left-2"
        : "text-neutral-400 top-6 -translate-y-1/2 scale-100"
    }
    peer-focus:text-white peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2 peer-focus:left-2`}
            >
              Write a bio...
            </label>
          </div>

          <button
            type="submit"
            className="transform transition-transform active:scale-[.95] duration-150 text-[15px] w-full bg-white font-semibold p-3 rounded-xl mt-4 text-black hover:bg-neutral-100 cursor-pointer"
          >
            Save Changes
          </button>

          <p
            className={`text-red-500 text-xs mt-2 ${displayNameError ? "" : "invisible"}`}
          >
            {displayNameError || " "}
          </p>
        </form>
      </div>
    </div>
  );
}
