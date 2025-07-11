import { useEffect, useState } from "react";
import { usePostContext } from "../context/PostContext";
import apiClient from "../api/apiClient.js";
import PostInput from "../components/PostInput";
import Feed from "../components/Feed";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner.jsx";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState([]);
  const { postsNeedRefresh, setPostsNeedRefresh, handlePost, loading } =
    usePostContext();
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const { tab: paramTab } = useParams();
  const tab = paramTab === "following" ? "following" : "bites";
  const navigate = useNavigate();

  const fetchPosts = async () => {
    const endpoint = tab === "following" ? "/posts/following/" : "/posts/";
    try {
      setIsLoading(true);
      const res = await apiClient.get(endpoint, { withCredentials: true });

      setPosts(res.data);

    if (!hasLoadedOnce) {
  setHasLoadedOnce(true);
}
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [tab]);

  useEffect(() => {
    if (postsNeedRefresh) {
      fetchPosts();
      setPostsNeedRefresh(false);
    }
  }, [postsNeedRefresh]);

  useEffect(() => {
    if (!loading) {
      requestAnimationFrame(() => setFadeIn(true));
    } else {
      setFadeIn(false);
    }
  }, [loading]);

  const onSubmit = async () => {
    if (!newPost.trim()) return;
    try {
      await handlePost({ content: newPost, media });
      setNewPost("");
      setMedia(null);
      setMediaPreview(null);
    } catch (err) {}
  };

  return (
    <div className="flex min-h-screen w-full text-white">
      <div className="flex flex-col flex-1">
        {/* Tabs */}
        <div className="flex text-m font-semibold justify-center text-neutral-500 sm:bg-transparent bg-[rgb(16,16,16)]">
          <button
            onClick={() => navigate("/home/bites")}
            className={`py-4 text-center cursor-pointer border-b w-1/2 sm:w-32 ${
              tab === "bites"
                ? "text-white border-neutral-300"
                : "border-transparent hover:text-white"
            }`}
          >
            Bites
          </button>
          <button
            onClick={() => navigate("/home/following")}
            className={`py-4 text-center cursor-pointer border-b w-1/2 sm:w-32 ${
              tab === "following"
                ? "text-white border-neutral-300"
                : "border-transparent hover:text-white"
            }`}
          >
            Following
          </button>
        </div>

        {/* Post Input and Feed */}
        <div className="relative flex-grow w-screen sm:w-auto max-w-160 sm:min-w-160 items-center pt-8 sm:rounded-t-3xl border-t border-neutral-800 bg-neutral-900">
          <PostInput
            newPost={newPost}
            setNewPost={setNewPost}
            handlePost={onSubmit}
            loading={loading}
            media={media}
            setMedia={setMedia}
            mediaPreview={mediaPreview}
            setMediaPreview={setMediaPreview}
          />
          {/* Loading / Fade Container */}
          {isLoading && !hasLoadedOnce ? (
            <Spinner />
          ) : (
            <div
              className={`transition-opacity duration-500 ease-in-out ${
                fadeIn ? "opacity-100" : "opacity-0"
              }`}
            >
              <Feed posts={posts} isLoading={false} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
