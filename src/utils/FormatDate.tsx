export const formatDate = (dateString: string, includeTime = false): string => {
  if (!dateString) return "Pending";
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(includeTime && { hour: "2-digit", minute: "2-digit" }),
  };
  return date.toLocaleDateString("en-PK", options);
};
