import Tooltip from "./Tooltip";
import Transpose from "./TransposeForm";

function Hero() {
  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md ">
          {/* Title */}
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
            <h1 className="text-5xl font-bold ">Transpose Rx</h1>
            <Tooltip />
          </div>
          {/* Description */}
          <p className="py-6">
            Easily convert glasses prescriptions from negative to positive
            cylinder format. Enter your original sphere, cylinder, and axis
            values to get the transposed equivalent instantly.
          </p>
          {/* Transposer */}
          <div>
            <Transpose />{" "}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
