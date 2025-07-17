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
  const [fadeIn, setFadeIn] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [postsByTab, setPostsByTab] = useState({
    bites: [],
    following: [],
  });
  const [nextPageByTab, setNextPageByTab] = useState({
    bites: null,
    following: null,
  });
  const [hasLoadedOnceByTab, setHasLoadedOnceByTab] = useState({
    bites: false,
    following: false,
  });
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
        setIsLoading(true);
        const endpoint = url || baseEndpoint;
        const res = await apiClient.get(endpoint, { withCredentials: true });

        if (url) {
          // Append posts for infinite scroll
          setPostsByTab((prev) => ({
            ...prev,
            [tab]: [...prev[tab], ...res.data.results],
          }));
        } else {
          // Initial load or tab change
          setPostsByTab((prev) => ({
            ...prev,
            [tab]: res.data.results,
          }));
          setHasLoadedOnceByTab((prev) => ({ ...prev, [tab]: true }));
        }
        setNextPageByTab((prev) => ({ ...prev, [tab]: res.data.next }));
      } catch (error) {
        console.error("Error fetching posts:", error);
        if (!url)
          setPostsByTab((prev) => ({
            ...prev,
            [tab]: [],
          }));
      } finally {
        setIsLoading(false);
        loadingMoreRef.current = false;
      }
    },
    [baseEndpoint, tab]
  );

  useEffect(() => {
    if (!hasLoadedOnceByTab[tab] || postsNeedRefresh) {
      fetchPosts();
      setPostsNeedRefresh(false);
    }
  }, [
    tab,
    hasLoadedOnceByTab,
    postsNeedRefresh,
    fetchPosts,
    setPostsNeedRefresh,
  ]);

  useEffect(() => {
    if (!loading) {
      requestAnimationFrame(() => setFadeIn(true));
    } 
  }, [loading]);

  // Infinite scroll handler
  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 300 &&
        !isLoading &&
        nextPageByTab[tab]
      ) {
        fetchPosts(nextPageByTab[tab]); // Fetch more posts if available
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLoading, nextPageByTab, fetchPosts]);

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
          {!hasLoadedOnceByTab[tab] && isLoading ? (
            <div className="spinner-wrapper">
              <Spinner />
            </div>
          ) : (
            <div
              className={`transition-opacity duration-500 ease-in-out ${
                fadeIn ? "opacity-100" : "opacity-0"
              }`}
            >
              <Feed posts={postsByTab[tab]} isLoading={false} />
            </div>
          )}

          {/* Show spinner at bottom while loading more */}
          {isLoading && hasLoadedOnceByTab[tab] && nextPageByTab[tab] && (
            <div className="my-4">
              <SmallSpinner />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
