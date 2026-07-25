function ModalMain({ isOpen, setIsOpen, title, content }) {
  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <div>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/70 p-4">
          <div className="bg-white dark:bg-dark-bg rounded-xl shadow-2xl max-w-3xl w-full border border-black/10 dark:border-white/10 overflow-hidden">
            <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 p-4 bg-gray-50 dark:bg-white/5">
              <h2 className="text-lg font-bold text-black dark:text-white">
                {title}
              </h2>
              <button
                type="button"
                className="text-xs font-bold text-white bg-brand hover:bg-brand/90 px-2.5 py-1 rounded-lg transition-colors cursor-pointer focus:outline-none"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[70vh]">
              <div className="break-words leading-6 text-black dark:text-white">
                {content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModalMain;

