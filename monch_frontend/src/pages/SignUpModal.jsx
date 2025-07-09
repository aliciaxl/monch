import { useState } from "react";
import apiClient from "../api/apiClient.js";
import toast from "react-hot-toast";

export default function SignUpModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
    password: "",
    confirmPassword: "",
  });

  const { username, displayName, password, confirmPassword } = formData;
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  const isFormFilled =
    username.trim() !== "" &&
    displayName.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "";

  const handleChange = (e) => {
    const { name } = e.target;
    let value = e.target.value; // Use let here for reassignment

    if (name === "username") {
      value = value.toLowerCase();
      setUsernameAvailable(null);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const checkUsername = async (username) => {
    if (!username) {
      setUsernameAvailable(null);
      return;
    }
    try {
      const res = await apiClient.get("/users/check-username", {
        params: { username: username },
        withCredentials: true,
      });
      setUsernameAvailable(res.data.available);
    } catch (err) {
      setUsernameAvailable(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    if (usernameAvailable === false) {
      alert("Username is already taken");
      return;
    }

    try {
      const res = await apiClient.post(
        "/users/register/",
        {
          username,
          displayName,
          password,
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Registration successful!");
      onClose(); // close modal
    } catch (error) {
      toast.error(error.response?.data?.detail || "Registration failed");
    }
  };

  if (!isOpen) return null;

  return (
     <div
    className="fixed inset-0 bg-neutral-900/10 backdrop-blur-lg flex justify-center items-center "
    onMouseDown={onClose}
  >
      <div
      className="relative pt-8 px-8 pb-16 rounded-xl w-full max-w-md shadow-lg border border-neutral-900 bg-neutral-900 flex flex-col"
      onMouseDown={(e) => e.stopPropagation()}
    >
        <button
          type="button"
          onClick={onClose}
          className="self-end px-4 text-white text-base hover:cursor-pointer focus:outline-none wiggle-zoom"
          aria-label="Close modal"
        >
          &#x2715;
        </button>

        <h2 className="font-bold text-base p-2 pb-4">Sign Up</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-2">
          <input
            type="text"
            name="username"
            maxLength={20}
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            onBlur={(e) => checkUsername(e.target.value)}
            className="text-[15px] bg-neutral-900 p-4 rounded-xl outline-none border-[.5px] border-neutral-800 focus:ring-1 focus:ring-neutral-700"
            required
          />
          {usernameAvailable === false && (
            <p className="text-red-500 text-xs">Username is taken</p>
          )}
          <input
            type="text"
            name="displayName"
            maxLength={30}
            placeholder="Display Name"
            value={formData.displayName}
            onChange={handleChange}
            className="text-[15px] bg-neutral-900 p-4 rounded-xl outline-none border-[.5px] border-neutral-800 focus:ring-1 focus:ring-neutral-700"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="text-[15px] bg-neutral-900 p-4 rounded-xl outline-none border-[.5px] border-neutral-800 focus:ring-1 focus:ring-neutral-700"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="text-[15px] bg-neutral-900 p-4 rounded-xl outline-none focus:ring-1 border-[.5px] border-neutral-800 focus:ring-neutral-700"
            required
          />
          <button
            type="submit"
            className={`text-[15px] bg-white font-semibold p-4 rounded-xl mt-4 
                            ${
                              isFormFilled && usernameAvailable !== false
                                ? "bg-white text-black cursor-pointer rounded-xl"
                                : "bg-white text-neutral-400 cursor-not-allowed rounded-xl"
                            }`}
            disabled={!isFormFilled || usernameAvailable === false}
          >
            Join Monch &#10047;
          </button>
        </form>
      </div>
    </div>
  );
}
