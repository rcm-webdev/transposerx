function Tooltip() {
  return (
    <div className="tooltip " data-tip="Learn">
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <button
        className="btn btn-primary w-full btn-wide sm:btn-square "
        onClick={() => {
          const dialog = document.getElementById(
            "my_modal_1"
          ) as HTMLDialogElement | null;
          dialog?.showModal();
        }}
      >
        <span className="block md:hidden">Learn</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className=" hidden md:block bg-accent p-0.5 rounded-xl"
        >
          <g
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          >
            <circle cx={6} cy={15} r={4}></circle>
            <circle cx={18} cy={15} r={4}></circle>
            <path d="M14 15a2 2 0 0 0-2-2a2 2 0 0 0-2 2m-7.5-2L5 7c.7-1.3 1.4-2 3-2m13.5 8L19 7c-.7-1.3-1.5-2-3-2"></path>
          </g>
        </svg>
      </button>
      <dialog id="my_modal_1" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Hello!</h3>
          <p className="py-4">
            Press ESC key or click the button below to close
          </p>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default Tooltip;
