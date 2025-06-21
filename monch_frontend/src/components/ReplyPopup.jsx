export default function ReplyPopup({ onClose }) {
  return (
    <div className="absolute mt-2 bg-neutral-800 text-white rounded-lg shadow-lg p-4 w-64 z-50">
      <textarea
        rows={2}
        placeholder="Write a reply..."
        className="w-full rounded-md bg-neutral-700 text-white p-2"
      />
      <div className="flex justify-end space-x-2 mt-2">
        <button
          onClick={onClose}
          className="px-3 py-1 text-sm text-gray-300 hover:text-white"
        >
          Cancel
        </button>
        <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-sm">
          Reply
        </button>
      </div>
    </div>
  );
}