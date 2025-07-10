import { useEffect, useState } from "react";
import { usePostContext } from "../context/PostContext";
import Post from "./Post";

export default function Feed({
  posts,
  isOwner = false,
  onPostDeleted,
  isLoading = false,
}) {
  const { postsNeedRefresh, setPostsNeedRefresh } = usePostContext();
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    if (postsNeedRefresh) {
      setPostsNeedRefresh(false);
    }
  }, [postsNeedRefresh, setPostsNeedRefresh]);
  useEffect(() => {
  if (!isLoading) {
  setTimeout(() => setFadeIn(true), 50);
} else {
  setFadeIn(false);
}
}, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full w-full py-8">
        <div
          className="animate-spin inline-block size-6 border-2 border-current border-t-transparent text-neutral-200 rounded-full dark:text-neutral-200"
          role="status"
          aria-label="loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return <div className="text-neutral-500 px-8 pt-4">No posts yet.</div>;
  }

  return (
    <div
      className={`w-full transition-opacity duration-700 ease-in-out ${
        fadeIn ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="border-t border-neutral-800">
      {posts.map((post) => (
        <Post
          key={post.id}
          post={post}
          isOwner={isOwner}
          onPostDeleted={onPostDeleted}
        />
      ))}
      </div>
    </div>
  );
}
