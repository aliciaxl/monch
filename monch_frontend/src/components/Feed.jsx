import { useEffect } from 'react';
import { usePostContext } from '../context/PostContext';
import Post from './Post';

export default function Feed({ posts, isOwner = false, onPostDeleted }) {
  const { postsNeedRefresh, setPostsNeedRefresh } = usePostContext();

  useEffect(() => {
    if (postsNeedRefresh) {
      setPostsNeedRefresh(false);
    }
  }, [postsNeedRefresh, setPostsNeedRefresh]);

  if (!posts || posts.length === 0) {
    return <div className="text-neutral-500 px-8 pt-4">No posts yet.</div>;
  }

  return (
    <div className="w-full">
      {posts.map((post) => (
        <Post
          key={post.id}
          post={post}
          isOwner={isOwner}
          onPostDeleted={onPostDeleted}
        />
      ))}
    </div>
  );
}
