
  export const getpriority = (priority) => {
  switch (priority) {
    case "Critical":
      return "text-red-600 bg-red-50 rounded-md";
    case "High":
      return "text-orange-600 bg-orange-50 rounded-md";
    case "Regular":
      return "text-blue-600 bg-blue-50 rounded-md";
    case "Low":
      return "text-green-600 bg-green-50 rounded-md";
    default:
      return "text-gray-600 bg-gray-50 rounded-md";
  }
};
