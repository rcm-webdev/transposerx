function Tooltip() {
  const steps = [
    "Add the Sphere and Cylinder values to get the new Sphere.",
    "Flip the sign of the Cylinder to make it positive.",
    "Adjust the Axis by 90 degrees. If the result is over 180, subtract 180 to keep it within the standard range.",
  ];

  return (
    <div className="tooltip w-full sm:w-auto " data-tip="Learn">
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
        <div className="modal-box space-y-6">
          <h3 className="font-bold text-lg">
            🔍 What’s Happening Behind the Scenes?
          </h3>
          <p>
            When you transpose a glasses prescription from negative cylinder to
            positive cylinder, we apply a standard formula used in optometry:
          </p>
          <ul className="py-4 text-left">
            {steps.map((step, index) => (
              <li key={index}>
                <strong>{index + 1}. </strong>
                {step}
              </li>
            ))}
          </ul>

          <div className="p-4 bg-base-200 rounded-box space-y-6">
            <h3 className="font-bold text-lg">Example</h3>
            <div className="space-y-6">
              <div className="flex flex-col rounded-2xl">
                <h3 className="font-bold mb-6">Original Rx</h3>
                <div className="flex gap-2 justify-center">
                  <div className="bg-base-300 rounded-2xl p-3 flex flex-col">
                    <span>Sphere</span>
                    <strong>-2.00</strong>
                  </div>
                  <div className="bg-base-300 rounded-2xl p-3 flex flex-col">
                    <span>Cylinder</span>
                    <strong>-1.00</strong>
                  </div>
                  <div className="bg-base-300 rounded-2xl p-3 flex flex-col">
                    <span>Axis</span>
                    <strong>180</strong>
                  </div>
                </div>
              </div>
              <div className="flex flex-col rounded-2xl">
                <h3 className="font-bold mb-6">Transposed Rx</h3>
                <div className="flex gap-2 justify-center">
                  <div className="bg-base-300 rounded-2xl p-3 flex flex-col">
                    <span>Sphere</span>
                    <strong>-3.00</strong>
                  </div>
                  <div className="bg-base-300 rounded-2xl p-3 flex flex-col">
                    <span>Cylinder</span>
                    <strong>+1.00</strong>
                  </div>
                  <div className="bg-base-300 rounded-2xl p-3 flex flex-col">
                    <span>Axis</span>
                    <strong>090</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
