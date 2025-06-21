export default function PostInput({ newPost, setNewPost, handlePost, loading }) {
  return (
    <div className="flex items-start border-b border-neutral-800 bg-neutral-900 px-8 pb-4">
      <textarea
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        placeholder="What's on your mind?"
        rows={1}
        maxLength={500}
        className="focus:outline-none focus:ring-0 h-12 w-full resize-none rounded-md bg-neutral-900 text-white px-2 pt-2"
      />
      <button
        onClick={handlePost}
        disabled={loading || !newPost.trim()}
        className="h-10 bg-neutral-900 hover:bg-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-4 border border-neutral-700 rounded-xl text-white"
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </div>
  );
}