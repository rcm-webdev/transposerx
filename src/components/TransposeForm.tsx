import { useState } from "react";
import toast from "react-hot-toast";

function Transpose() {
  const [sphere, setSphere] = useState("1.00");
  const [cylinder, setCylinder] = useState("-0.25");
  const [axis, setAxis] = useState("180");
  const [result, setResult] = useState<{
    sphere: number;
    cylinder: number;
    axis: number;
  } | null>(null);

  const handleTranspose = () => {
    const s = parseFloat(sphere);
    const c = parseFloat(cylinder);
    const a = parseInt(axis);

    if (isNaN(s) || isNaN(c) || isNaN(a) || a < 0 || a > 180) {
      toast.error(
        "Please enter valid numbers. Axis must be between 0 and 180."
      );
      return;
    }

    const newSphere = s + c;
    const newCylinder = -c;
    let newAxis = (a + 90) % 180;
    if (newAxis === 0) newAxis = 180;

    setResult({
      sphere: parseFloat(newSphere.toFixed(3)),
      cylinder: parseFloat(newCylinder.toFixed(3)),
      axis: parseFloat(newAxis.toFixed(3)),
    });
  };

  const handleCopy = async () => {
    if (!result) return;
    const formattedAxis = result.axis.toFixed(0).padStart(2, "0");
    const text = `${result.sphere} + ${result.cylinder} x ${formattedAxis}`;
    try {
      await navigator.clipboard.writeText(text);
      // toast success
      toast.success("Copied to clipboard!");
    } catch {
      // toast error
      toast.error("Failed to copy.");
    }
  };

  const inputs = [
    {
      label: "Sphere",
      value: sphere,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setSphere(e.target.value),
      step: "0.25",
    },
    {
      label: "Cylinder",
      value: cylinder,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setCylinder(e.target.value),
      step: "0.25",
    },
    {
      label: "Axis (0 - 180)",
      value: axis,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setAxis(e.target.value),
      step: "1",
    },
  ];

  const outputs = [
    {
      label: "Sphere",
      value: result?.sphere?.toFixed(2),
    },
    {
      label: "Cylinder",
      value: result?.cylinder?.toFixed(2),
    },
    {
      label: "Axis",
      value: result?.axis,
    },
  ];

  return (
    <div className="max-w-md mx-auto p-4 bg-base-100 shadow-lg rounded-box space-y-6 mb-6">
      <h2 className="text-xl font-bold mb-6">Transposition</h2>

      <div className="flex gap-2 items-center justify-center">
        {inputs.map((input, index) => (
          <div
            key={index}
            className="form-control flex flex-col items-center gap-2 justify-center"
          >
            <label className="label font-bold">{input.label}</label>
            <input
              type="number"
              step={input.step}
              className="input input-bordered max-w-28"
              value={input.value}
              onChange={input.onChange}
            />
          </div>
        ))}
      </div>

      <button className="btn btn-primary w-full" onClick={handleTranspose}>
        Transpose
      </button>

      {result && (
        <div className="p-4 bg-base-200 rounded-box space-y-6">
          <h3 className="font-semibold">Transposed Prescription:</h3>
          <div className="flex gap-2 justify-center">
            {outputs.map((output, index) => (
              <div
                key={index}
                className="flex flex-col bg-base-300 p-3 rounded-2xl "
              >
                <span>{output.label}</span>
                <strong>{output.value}</strong>
              </div>
            ))}
          </div>

          {/* Copy Button */}
          <button className="btn btn-outline btn-sm mt-2 " onClick={handleCopy}>
            <span>Copy Rx </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default Transpose;
