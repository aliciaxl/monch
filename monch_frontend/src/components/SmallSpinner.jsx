function SmallSpinner() {
  return (
    <div className="flex justify-center my-2">
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

export default SmallSpinner;
