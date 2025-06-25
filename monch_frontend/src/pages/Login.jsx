import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from "../api/apiClient.js"
import SignUpModal from './SignUpModal';

export default function Login({ user, setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const isFormFilled = username.trim() !== '' && password.trim() !== '';

  const login = async (username, password) => {

    try {
        const response = await apiClient.post('/login/', { username, password });

        setUser(username);
        navigate('/home');
    } catch (error) {
        const errorMsg = error.response?.data?.detail || error.message || 'Login failed';
        alert(errorMsg);
    }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        login(username, password);
    };

    const loginAsGuest = (e) => {
        e.preventDefault();
        login('admin', 'strongPassword');
    };

    const signUp = (e) => {
        e.preventDefault();
    }

  return (
    <>
        <div className="flex justify-center items-center min-h-screen">
            <div className="w-96">
                <h1 className="title mb-20">MONCH</h1>
                <h2 className="font-semibold text-base p-2 pb-4">Log in</h2>
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
                            type="password" 
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
                                    : 'bg-white text-neutral-400 cursor-not-allowed rounded-xl'
                                }`} 
                            disabled={!isFormFilled}>Log in
                        </button>
                    </div>
                    <div className="flex items-center justify-center my-4">
                        <hr className="border-t-1 border-neutral-800 w-8 my-2" />
                        <span className="text-neutral-500 mx-4">or</span>
                        <hr className="border-t-1 border-neutral-800 w-8 my-2" />
                    </div>
                </form>
                <form onSubmit={loginAsGuest}>
                    <div className="flex flex-col px-2">
                        <button 
                            type="submit" 
                            className="group relative flex items-center justify-center text-[15px] bg-white text-black font-semibold p-4 rounded-xl cursor-pointer">
                            <span>Log in as a Guest</span>
                            <div className="w-0 translate-x-[100%] pl-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-0 group-hover:pl-1 group-hover:opacity-100"><svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg></div>
                        </button>
                    </div>
                </form>
                <form onSubmit={signUp}>
                    <div className="flex flex-col mt-2 px-2">
                        <button 
                            onClick={() => setShowModal(true)}
                            type="button" 
                            className="group relative flex items-center justify-center text-[15px] bg-indigo-500 text-white font-semibold p-4 rounded-xl cursor-pointer">
                            <span>Sign up</span>
                        </button>
                    </div>
                </form>
                {showModal && <SignUpModal isOpen={showModal} onClose={() => setShowModal(false)} />}
            </div>
        </div>
    </>
  );
}