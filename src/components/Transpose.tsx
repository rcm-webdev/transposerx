function Transpose() {
  return (
    <div className="m-6 space-y-6 ">
      <label className="input">
        <span className="label">OD </span>
        <input type="text" placeholder="SPH" />
        <input type="text" placeholder="CYL" />
        <input type="text" placeholder="AXIS" />
      </label>
      <label className="input">
        <span className="label">OS </span>
        <input type="text" placeholder="SPH" />
        <input type="text" placeholder="CYL" />
        <input type="text" placeholder="AXIS" />
      </label>
    </div>
  );
}

export default Transpose;
