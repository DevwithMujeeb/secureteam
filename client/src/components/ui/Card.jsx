const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`
        bg-white/5 border border-white/10 rounded-xl p-6
        backdrop-blur-sm ${className}
      `}>
      {children}
    </div>
  );
};

export default Card;
