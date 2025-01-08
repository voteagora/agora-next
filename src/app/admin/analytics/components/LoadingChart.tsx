const LoadingChart = ({ type = "bar" }: { type?: "bar" | "pie" }) => {
  const numOfCols = type === "bar" ? 8 : 1;
  return (
    <div className="mt-6 w-full h-[400px]">
      <div className="grid grid-cols-8 gap-4 h-full">
        {[...Array(numOfCols)].map((i) => (
          <div
            key={i}
            className="w-full bg-gray-200 rounded block place-self-end animate-pulse"
            style={{ height: `${Math.random() * 60 + 40}%` }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingChart;
