import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/apiClient";
import { useAuth } from '../context/AuthContext';

export default function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const delayDebounce = setTimeout(() => {
      if (query.trim()) {
        setLoading(true);
        apiClient
          .get(`/users/search`, {
            params: { q: query },
            withCredentials: true,
            signal: controller.signal,
          })
          .then((res) => {
            const filtered = res.data.filter(u => u.id !== user?.id);
            setResults(filtered);
          })
          .catch((err) => {
            if (err.name !== "CanceledError") console.error(err);
          })
          .finally(() => setLoading(false));
      } else {
        setResults([]);
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(delayDebounce);
      controller.abort();
    };
  }, [query, user?.id]);

  return (
    <>
      <div className="flex text-m font-semibold justify-center text-neutral-500">
        <span className="w-32 py-4 text-center text-white">Search</span>
      </div>

      <div className="flex flex-col h-screen w-160 items-center pt-7 rounded-t-3xl border-neutral-800 bg-neutral-900">
        <div className="relative flex w-[calc(100%-4rem)] mx-4 mb-4">
          {/* Search Icon */}
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-5 top-1/2 transform -translate-y-1/2 text-neutral-500"
          />

          {/* Input Field */}
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 py-3 rounded-2xl bg-black focus:outline-none text-white border border-neutral-800"
          />
        </div>

        {/* Results */}
        <div className="w-full">
          {loading && query.trim() !== "" && (
            <div className="text-white py-4">Loading...</div>
          )}
          {!loading && results.length === 0 && query.trim() !== "" && (
            <div className="text-neutral-400 py-4">No users found.</div>
          )}

          {results.map((user) => (
            <div
              key={user.id}
              className="flex w-full justify-between border-b border-neutral-800 px-6 pt-4 py-6 pr-12 bg-neutral-900"
            >
              <div className="flex items-start pt-2">
                {/* Avatar */}
                <div className="self-start flex-none w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-semibold overflow-hidden mr-4">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {user.display_name?.[0]?.toUpperCase() ||
                        user.username[0]?.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Text Content */}
                <div className="flex flex-col text-left mr-8">
                    <Link
                    to={`/user/${user.username}`}
                    className="text-sm text-white font-bold"
                  >
                    @{user.username}
                  </Link>
                  <div className="text-sm text-neutral-400">
                    {user.display_name || user.username}
                  </div>
                  <div className="text-sm text-neutral-400 mt-3">{user.bio}</div>
                </div>
              </div>
            
              {/* Follow Button */}
              <div className="flex items-center ">
              <button
                className="transform transition-transform active:scale-[.95] duration-150 h-10 bg-neutral-900 hover:bg-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-4 border border-neutral-700 rounded-xl text-white"
                onClick={() => {
                  // TODO: replace with real follow logic
                  alert(`Followed ${user.username}`);
                }}
              >
                Follow
              </button>
              </div>
              
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
