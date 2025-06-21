// components/Post.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { formatDistanceToNow } from "date-fns";

export default function Post({ post }) {
  return (
    <div className="flex items-start w-full border-b border-neutral-800 px-8 p-4 bg-neutral-900">
      <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-semibold mr-4">
        {post.user[0]?.toUpperCase()}
      </div>
      <div>
        <div className="flex text-sm text-neutral-400 mb-1">
          <span className="font-semibold text-white mr-2">{post.user}</span>
          {formatDistanceToNow(new Date(post.created_at), {
            addSuffix: true,
          })}
        </div>
        <div className="text-white text-base">{post.content}</div>
        <div className="flex space-x-4 mt-4 text-sm text-neutral-400">
          <button className="hover:text-white flex items-center space-x-1 mr-8">
            <FontAwesomeIcon icon={faHeart} />
            <span>{post.likes || 0}</span>
          </button>
          <button className="hover:text-white flex items-center space-x-1">
            <FontAwesomeIcon icon={faCommentDots} />
          </button>
        </div>
      </div>
    </div>
  );
}
