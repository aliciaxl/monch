import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

const ConfirmDialog = ({ open, onClose, onConfirm }) => (
  <Popup open={open} closeOnDocumentClick onClose={onClose}>
    <div className="fixed inset-0 bg-neutral-700/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-68 bg-neutral-900 text-white rounded-xl border-[0.5px] border-neutral-700 overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <h2 className="font-semibold">Delete Post</h2>
        </div>
        <div className="px-5 pb-6">
          <p className="text-base text-neutral-600">Are you sure you want to delete this post?</p>
        </div>
        <div className="flex">
          <button
            onClick={onClose}
            className="w-1/2 py-4 border-t border-neutral-800 font-semibold text-neutral-300 hover:bg-neutral-700 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-1/2 py-4 border-t border-l border-neutral-800 font-semibold text-red-500 hover:bg-neutral-700 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </Popup>
);

export default ConfirmDialog;
