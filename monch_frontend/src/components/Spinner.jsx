function Spinner() {
  return (
    <div className="relative w-full min-h-screen">
      <div className="absolute inset-0 bg-neutral-900 flex justify-center items-center">
        <div
          className="animate-spin inline-block size-6 border-2 border-current border-t-transparent text-neutral-200 rounded-full dark:text-neutral-200"
          role="status"
          aria-label="loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  );
}

export default Spinner;