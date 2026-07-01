const Card = ({ children, className = "", onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white/5 border border-white/10 rounded-xl p-6
        backdrop-blur-sm ${className}
        ${onClick ? "cursor-pointer" : ""}
      `}>
      {children}
    </div>
  );
};

export default Card;
