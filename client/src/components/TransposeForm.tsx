import { useState } from "react";
import toast from "react-hot-toast";

interface EyeValues {
  sphere: string;
  cylinder: string;
  axis: string;
}

interface TransposedValues {
  sphere: number;
  cylinder: number;
  axis: number;
}

interface EyeFormProps {
  label: string;
  values: EyeValues;
  onValuesChange: (values: EyeValues) => void;
  transposedValues: TransposedValues | null;
}

function EyeForm({ label, values, onValuesChange, transposedValues }: EyeFormProps) {
  const inputs = [
    {
      label: "Sphere",
      value: values.sphere,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        onValuesChange({ ...values, sphere: e.target.value }),
      step: "0.25",
    },
    {
      label: "Cylinder",
      value: values.cylinder,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        onValuesChange({ ...values, cylinder: e.target.value }),
      step: "0.25",
    },
    {
      label: "Axis (0 - 180)",
      value: values.axis,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        onValuesChange({ ...values, axis: e.target.value }),
      step: "1",
    },
  ];

  const outputs = transposedValues ? [
    {
      label: "Sphere",
      value: `${transposedValues.sphere >= 0 ? "+" : ""}${transposedValues.sphere.toFixed(2)}`,
    },
    {
      label: "Cylinder",
      value: `${transposedValues.cylinder >= 0 ? "+" : ""}${transposedValues.cylinder.toFixed(2)}`,
    },
    {
      label: "Axis",
      value: transposedValues.axis.toFixed(0).padStart(3, "0"),
    },
  ] : [];

  return (
    <div className="space-y-4 p-4 bg-base-200 rounded-lg">
      <h3 className="text-lg font-semibold text-center">{label}</h3>
      <div className="space-y-4">
        {inputs.map((input, index) => (
          <div
            key={index}
            className="form-control flex flex-row items-center gap-4 justify-between"
          >
            <label className="label font-medium w-24">{input.label}</label>
            <input
              type="number"
              step={input.step}
              className="input input-bordered w-32"
              value={input.value}
              onChange={input.onChange}
            />
          </div>
        ))}
      </div>

      {transposedValues && (
        <div className="mt-4 p-4 bg-base-300 rounded-lg space-y-2">
          <h4 className="font-semibold text-center">Transposed {label}:</h4>
          <div className="space-y-2">
            {outputs.map((output, index) => (
              <div
                key={index}
                className="flex justify-between items-center px-2"
              >
                <span>{output.label}</span>
                <strong>{output.value}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Transpose() {
  const defaultEyeValues: EyeValues = {
    sphere: "1.00",
    cylinder: "-0.25",
    axis: "180",
  };

  const [odValues, setOdValues] = useState<EyeValues>(defaultEyeValues);
  const [osValues, setOsValues] = useState<EyeValues>(defaultEyeValues);
  const [results, setResults] = useState<{
    od: TransposedValues | null;
    os: TransposedValues | null;
  }>({ od: null, os: null });

  const handleTranspose = (values: EyeValues, isOD: boolean) => {
    const s = parseFloat(values.sphere);
    const c = parseFloat(values.cylinder);
    const a = parseInt(values.axis);

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

    const newResult = {
      sphere: parseFloat(newSphere.toFixed(3)),
      cylinder: parseFloat(newCylinder.toFixed(3)),
      axis: parseFloat(newAxis.toFixed(3)),
    };

    setResults(prev => ({
      ...prev,
      [isOD ? 'od' : 'os']: newResult
    }));
  };

  const handleTransposeBoth = () => {
    handleTranspose(odValues, true);
    handleTranspose(osValues, false);
  };

  const handleCopy = async () => {
    if (!results.od && !results.os) return;

    const formatPrescription = (values: TransposedValues) => {
      const sphere = `${values.sphere >= 0 ? "+" : ""}${values.sphere.toFixed(2)}`;
      const cylinder = `${values.cylinder >= 0 ? "+" : ""}${values.cylinder.toFixed(2)}`;
      const axis = values.axis.toFixed(0).padStart(3, "0");
      return `${sphere} ${cylinder} x ${axis}`;
    };

    const text = [
      results.od ? `OD: ${formatPrescription(results.od)}` : '',
      results.os ? `OS: ${formatPrescription(results.os)}` : '',
    ].filter(Boolean).join('\n');

    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-base-100 shadow-lg rounded-box space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">Prescription Transposition</h2>

      <div className="space-y-6">
        <EyeForm
          label="OD (Right Eye)"
          values={odValues}
          onValuesChange={setOdValues}
          transposedValues={results.od}
        />
        <EyeForm
          label="OS (Left Eye)"
          values={osValues}
          onValuesChange={setOsValues}
          transposedValues={results.os}
        />
      </div>

      <div className="space-y-4 pt-4">
        <button 
          className="btn btn-primary w-full"
          onClick={handleTransposeBoth}
        >
          Transpose Prescription
        </button>

        {(results.od || results.os) && (
          <button 
            className="btn btn-outline w-full" 
            onClick={handleCopy}
          >
            <span>Copy Complete Rx</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4 ml-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default Transpose;
