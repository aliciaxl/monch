import { useEffect, useState, useCallback, useRef } from "react";
import { usePostContext } from "../context/PostContext";
import apiClient from "../api/apiClient.js";
import PostInput from "../components/PostInput";
import Feed from "../components/Feed";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner.jsx";
import SmallSpinner from "../components/SmallSpinner.jsx";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState([]);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const loadingMoreRef = useRef(false);
  const { postsNeedRefresh, setPostsNeedRefresh, handlePost, loading } =
    usePostContext();
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const { tab: paramTab } = useParams();
  const tab = paramTab === "following" ? "following" : "bites";
  const navigate = useNavigate();

  // Base endpoint based on tab
  const baseEndpoint = tab === "following" ? "/posts/following/" : "/posts/";

  const fetchPosts = useCallback(
    async (url) => {
      if (loadingMoreRef.current) return;
      loadingMoreRef.current = true;

      try {
        setIsLoading(true); // Set loading state
        const res = await apiClient.get(url || baseEndpoint, {
          withCredentials: true,
        });

        if (url) {
          // Append posts for infinite scroll
          setPosts((prev) => [...prev, ...res.data.results]);
        } else {
          // Initial load or tab change
          setPosts(res.data.results);
          setHasLoadedOnce(true); // Mark that posts have been loaded
        }

        setNextPageUrl(res.data.next); // Update the next page URL
      } catch (error) {
        console.error("Error fetching posts:", error);
        if (!url) setPosts([]); // Handle error
      } finally {
        setIsLoading(false);
        loadingMoreRef.current = false;
      }
    },
    [baseEndpoint]
  );

  useEffect(() => {
    // Only reset state when switching tabs
    setIsLoading(true); // Show spinner when switching tabs
    setPosts([]); // Clear posts
    setHasLoadedOnce(false); // Reset loaded state
    setNextPageUrl(null); // Reset nextPageUrl
    fetchPosts(); // Fetch initial posts for the new tab
  }, [fetchPosts, tab]);

  useEffect(() => {
    if (postsNeedRefresh) {
      fetchPosts();
      setPostsNeedRefresh(false);
    }
  }, [postsNeedRefresh, fetchPosts, setPostsNeedRefresh]);

  useEffect(() => {
    if (!loading) {
      requestAnimationFrame(() => setFadeIn(true));
    } else {
      setFadeIn(false);
    }
  }, [loading]);

  // Infinite scroll handler
  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 300 &&
        !isLoading &&
        nextPageUrl
      ) {
        fetchPosts(nextPageUrl); // Fetch more posts if available
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLoading, nextPageUrl, fetchPosts]);

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
    <div className="home flex flex-col flex-grow w-full h-full text-whitesm:px-0">
      <div className="flex flex-col flex-1 w-full mx-auto">
        {/* TITLE---------Tabs */}
        <div className="flex w-full font-semibold justify-center text-neutral-500 sm:bg-transparent bg-[rgb(16,16,16)]">
          <button
            onClick={() => navigate("/home/bites")}
            className={`py-4 text-center cursor-pointer border-b w-1/2 sm:w-52 ${
              tab === "bites"
                ? "text-white border-neutral-300"
                : "border-transparent hover:text-white"
            }`}
          >
            Bites
          </button>
          <button
            onClick={() => navigate("/home/following")}
            className={`py-4 text-center cursor-pointer border-b w-1/2 sm:w-52 ${
              tab === "following"
                ? "text-white border-neutral-300"
                : "border-transparent hover:text-white"
            }`}
          >
            Following
          </button>
        </div>

        {/* FEED------------Post Input and Feed */}
        <div className="flex flex-grow flex-col w-full min-w-full pt-8 sm:rounded-t-3xl border-t border-neutral-800 bg-neutral-900">
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
          {!hasLoadedOnce && isLoading ? (
            <div className="spinner-wrapper">
              <Spinner />
            </div>
          ) : (
            <div
              className={`transition-opacity duration-500 ease-in-out ${
                fadeIn ? "opacity-100" : "opacity-0"
              }`}
            >
              <Feed posts={posts} isLoading={false} />
            </div>
          )}

          {/* Show spinner at bottom while loading more */}
          {isLoading && hasLoadedOnce && nextPageUrl && (
            <div className="my-4">
              <SmallSpinner />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
