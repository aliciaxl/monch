import { useState } from "react";

export default function EditProfile({ userData, onClose, onSave }) {
  const [formData, setFormData] = useState({
    displayName: userData.display_name || "",
    bio: userData.bio || "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // Call parent save handler
    onClose(); // Close modal
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

        <h2 className="font-bold text-base p-2 pb-4">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-2">
          {/* Display Name with floating label */}
          <div className="relative">
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              required
              className="w-full text-sm text-white p-4 pt-6 bg-neutral-800 rounded-xl outline-none focus:ring-1 focus:ring-neutral-700 peer"
              placeholder={userData.display_name || "Display Name"}
            />
            <label className="absolute left-4 top-2 text-xs text-neutral-400 peer-focus:text-neutral-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-neutral-500 transition-all">
              Display Name
            </label>
          </div>

          {/* Bio with floating label */}
          <div className="relative">
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              required
              className="w-full text-sm text-white p-4 pt-6 bg-neutral-800 rounded-xl outline-none focus:ring-1 focus:ring-neutral-700 peer resize-none"
              placeholder={userData.bio || "Display Name"}
            />
            <label className="absolute left-4 top-2 text-xs text-neutral-400 peer-focus:text-neutral-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-neutral-500 transition-all">
              Bio
            </label>
          </div>

          <button
            type="submit"
            className="text-[15px] bg-white font-semibold p-4 rounded-xl mt-4 text-black hover:bg-neutral-100"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
