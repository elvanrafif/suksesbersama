export const SkeletonLoadingTable = () => {
  return (
    <div className="space-y-2 w-full">
      {Array(10)
        .fill("")
        .map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gray-100 rounded-md h-12 animate-pulse"
          ></div>
        ))}
    </div>
  );
};

export const SkeletonLoadingReceipt = () => (
  <div className="flex items-center justify-between p-4 bg-gray-100 rounded-md h-72 w-full animate-pulse"></div>
);
