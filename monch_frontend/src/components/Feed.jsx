import { useEffect, useState } from "react";
import { usePostContext } from "../context/PostContext";
import Post from "./Post";

export default function Feed({
  posts,
  isOwner = false,
  onPostDeleted,
  isLoading = false,
  noTopBorder,
  showRepliesWithParents = false,
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
    return <div className="text-neutral-500 px-8 pt-6">No posts yet.</div>;
  }

  return (
    <div
      className={`w-full transition-opacity duration-700 ease-in-out ${
        fadeIn ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className={`${noTopBorder ? "" : "border-t"} border-neutral-800`}>
        {showRepliesWithParents ? (
          posts.map((reply) => (
            <div key={reply.id} className=" border-b border-neutral-800">
              {/* Render parent post */}
              {reply.parent_post_detail && (
                <Post
                  post={reply.parent_post_detail}
                  isOwner={false}
                  onPostDeleted={onPostDeleted}
                />
              )}
              {/* Render reply*/}
              <div className="">
                <Post
                  post={reply}
                  isOwner={isOwner}
                  onPostDeleted={onPostDeleted}
                  isReplyWithParent={true}
                />
              </div>
            </div>
          ))
        ) : (
          posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              isOwner={isOwner}
              onPostDeleted={onPostDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
}