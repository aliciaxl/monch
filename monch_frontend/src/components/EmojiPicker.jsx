import { EmojiPicker } from "frimousse";

export function MyEmojiPicker({ onEmojiClick }) {
  return (
    <EmojiPicker.Root className="isolate flex h-[280px] w-[300px] rounded-2xl flex-col bg-[rgb(16,16,16)] p-2 ">
      <EmojiPicker.Search className="z-10 mx-2 mt-2 appearance-none rounded-md px-2.5 py-2 text-sm bg-neutral-800 focus:outline-none" />
      <EmojiPicker.Viewport className="relative flex-1 overflow-auto scrollbar-hidden">
        <EmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-sm text-neutral-500">
          Loading…
        </EmojiPicker.Loading>
        <EmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-sm text-neutral-500">
          No emoji found.
        </EmojiPicker.Empty>
        <EmojiPicker.List
          className="select-none pb-1.5"
          components={{
            CategoryHeader: ({ category, ...props }) => (
              <div
                className="px-3 pt-3 pb-1 font-medium text-neutral-400 text-xs text-left bg-[rgb(16,16,16)]"
                {...props}
              >
                {category.label}
              </div>
            ),
            Row: ({ children, ...props }) => (
              <div className="scroll-my-1.5 pl-1.5 flex" {...props}>
                {children}
              </div>
            ),
            Emoji: ({ emoji, ...props }) => (
              <button
              {...props}
              onClick={(e) => {
                e.preventDefault();
                if (onEmojiClick) onEmojiClick(emoji);
              }}
              className="flex size-8 items-center justify-center rounded-md text-2xl data-[active]:bg-neutral-800 cursor-pointer"
            >
              {emoji.emoji}
            </button>
            ),
          }}
        />
      </EmojiPicker.Viewport>
    </EmojiPicker.Root>
  );
}