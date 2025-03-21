import Transpose from "./Transpose";

function Hero() {
  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md ">
          {/* Title */}
          <div className="flex gap-2 items-center justify-center">
            <h1 className="text-5xl font-bold ">Transpose Rx</h1>
            <span className="tooltip" data-tip="Let's get started">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-12 h-12 bg-accent p-2 rounded-xl"
              >
                <g
                  fill="none"
                  stroke="#cdfd02"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                >
                  <circle cx={6} cy={15} r={4}></circle>
                  <circle cx={18} cy={15} r={4}></circle>
                  <path d="M14 15a2 2 0 0 0-2-2a2 2 0 0 0-2 2m-7.5-2L5 7c.7-1.3 1.4-2 3-2m13.5 8L19 7c-.7-1.3-1.5-2-3-2"></path>
                </g>
              </svg>
            </span>
          </div>
          {/* Description */}
          <p className="py-6">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima sunt
            illum, dolore nam consequatur pariatur! Lorem ipsum dolor sit amet,
            consectetur adipisicing elit.
          </p>
          {/* Transposer */}
          <div>
            <Transpose />{" "}
          </div>

          <button className="btn btn-primary">Get Started</button>
        </div>
      </div>
    </div>
  );
}

export default Hero;
