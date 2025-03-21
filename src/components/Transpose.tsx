const transposerRx = () => {
  return "Hello from transposer component";
};

function Transpose() {
  return (
    <div className="m-6">
      <p className="btn btn-accent">{transposerRx()}</p>
    </div>
  );
}

export default Transpose;
