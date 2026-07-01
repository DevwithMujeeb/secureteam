const variants = {
  owner: "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30",
  admin: "bg-blue-400/20 text-blue-400 border border-blue-400/30",
  member: "bg-gray-400/20 text-gray-400 border border-gray-400/30",
  active: "bg-green-400/20 text-green-400 border border-green-400/30",
  archived: "bg-gray-400/20 text-gray-400 border border-gray-400/30",
  todo: "bg-gray-400/20 text-gray-400 border border-gray-400/30",
  in_progress: "bg-blue-400/20 text-blue-400 border border-blue-400/30",
  done: "bg-green-400/20 text-green-400 border border-green-400/30",
  high: "bg-red-400/20 text-red-400 border border-red-400/30",
  medium: "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30",
  low: "bg-gray-400/20 text-gray-400 border border-gray-400/30",
};

const Badge = ({ label, variant }) => {
  const style = variants[variant] || variants.member;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style}`}>
      {label}
    </span>
  );
};

export default Badge;
