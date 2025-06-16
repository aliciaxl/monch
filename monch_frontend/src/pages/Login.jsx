import React, { useState } from 'react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const isFormFilled = username.trim() !== '' && password.trim() !== '';

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Username:', username);
    console.log('Password:', password);
  };

  return (
    <>
        <div className="w-96">
            <h2 className="font-bold text-base p-2">Log in</h2>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2 p-2">
                <input 
                    id="username" 
                    type="text" 
                    className="text-[15px] bg-neutral-900 p-4 rounded-xl outline-none focus:ring-1 focus:ring-neutral-700" 
                    value={username} 
                    placeholder="Username" 
                    onChange={(e) => setUsername(e.target.value)} 
                    required
                />
                <input 
                    id="password" 
                    type="text" 
                    className="text-[15px] bg-neutral-900 p-4 rounded-xl outline-none focus:ring-1 focus:ring-neutral-700" 
                    value={password} 
                    placeholder="Password" 
                    onChange={(e) => setPassword(e.target.value)} 
                    required
                />
                <button 
                type="submit" 
                className={`text-[15px] bg-white font-semibold p-4 rounded-xl" 
                    ${isFormFilled
                        ? 'bg-white text-black cursor-pointer rounded-xl' 
                        : 'bg-white text-neutral-400 cursor-not-alowed rounded-xl'
                    }`} 
                    disabled={!isFormFilled}>Log in</button>
                </div>
            </form>
            <div className="flex items-center justify-center my-4">
                <hr className="border-t-1 border-neutral-800 w-8 my-2" />
                <span className="text-neutral-500 mx-4">or</span>
                <hr className="border-t-1 border-neutral-800 w-8 my-2" />
            </div>
        </div>
    </>
  );
}