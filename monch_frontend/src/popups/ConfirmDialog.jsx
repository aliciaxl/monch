const ConfirmDialog = ({ open, onClose, onConfirm }) => {
  if (!open) return null; // Don't render anything if not open

  return (
    <div
      className="fixed inset-0  bg-black/50 backdrop-blur-md flex items-center justify-center z-50"
      onMouseDown={onClose} // Close modal if clicking outside content
    >
      <div
        className="w-68 bg-neutral-900 text-white rounded-xl border-[0.5px] border-neutral-700 overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()} // Prevent closing if clicking inside modal
      >
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-base font-semibold">Delete Post</h2>
        </div>
        <div className="px-5 pb-6">
          <p className="text-base text-neutral-400">Are you sure you want to delete this post?</p>
        </div>
        <div className="flex">
          <button
            onClick={onClose}
            className="w-1/2 py-4 border-t border-neutral-800 text-sm text-neutral-200 hover:bg-neutral-700 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-1/2 py-4 border-t border-l border-neutral-800 text-sm text-red-500 hover:bg-neutral-700 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
