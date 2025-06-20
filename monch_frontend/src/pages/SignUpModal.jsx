import React, { useState } from 'react';

export default function SignUpModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    password: '',
    confirmPassword: '',
  });

  const { username, displayName, password, confirmPassword } = formData;
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  const isFormFilled = 
    username.trim() !== '' && 
    displayName.trim() !== '' && 
    password.trim() !== '' && 
    confirmPassword.trim() !== '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'username') {
    // Clear previous username availability status as user edits
    setUsernameAvailable(null);
  }
  };

  const checkUsername = async (username) => {
    if (!username) {
        setUsernameAvailable(null);
        return;
    }
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/users/check-username?username=${username}`);
        const data = await res.json();
        setUsernameAvailable(data.available);
    } catch (err) {
        setUsernameAvailable(null);
    }
    };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    try {
    const response = await fetch('http://127.0.0.1:8000/api/users/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: formData.username,
        displayName: formData.displayName,
        password: formData.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Show error message from backend
      alert(errorData.detail || 'Registration failed');
      return;
    }

    const data = await response.json();
    console.log('Registration successful:', data);

    onClose(); // close modal after successful registration

  } catch (error) {
    console.error('Error during registration:', error);
    alert('Something went wrong. Please try again.');
  }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
      <div className="relative pt-8 px-8 pb-16 rounded-xl w-full max-w-md shadow-lg border border-neutral-900 flex flex-col">
        <button
            type="button"
            onClick={onClose}
            className="self-end px-4 text-white text-base hover:cursor-pointer focus:outline-none wiggle-zoom"
            aria-label="Close modal">
            &#x2715;
        </button>

        <h2 className="font-bold text-base p-2 pb-4">Sign Up</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-2">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            onBlur={(e) => checkUsername(e.target.value)} 
            className="text-[15px] bg-neutral-900 p-4 rounded-xl outline-none focus:ring-1 focus:ring-neutral-700" 
            required
          />
          {usernameAvailable === false && <p className="text-red-500 text-xs">Username is taken</p>} 
          <input
            type="text"
            name="displayName"
            placeholder="Display Name"
            value={formData.displayName}
            onChange={handleChange}
            className="text-[15px] bg-neutral-900 p-4 rounded-xl outline-none focus:ring-1 focus:ring-neutral-700" 
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="text-[15px] bg-neutral-900 p-4 rounded-xl outline-none focus:ring-1 focus:ring-neutral-700" 
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="text-[15px] bg-neutral-900 p-4 rounded-xl outline-none focus:ring-1 focus:ring-neutral-700" 
            required
          />
          <button
            type="submit"
            className={`text-[15px] bg-white font-semibold p-4 rounded-xl mt-4 
                            ${isFormFilled && usernameAvailable !== false
                                ? 'bg-white text-black cursor-pointer rounded-xl' 
                                : 'bg-white text-neutral-400 cursor-not-allowed rounded-xl'
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
