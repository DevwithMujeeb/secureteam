const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder = "",
  error = "",
  required = false,
  disabled = false,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm text-gray-400 font-medium">
          {label}
          {required && <span className="text-green-400 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`
          w-full px-4 py-2.5 rounded-lg text-sm
          bg-white/5 border text-white placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-green-400/50
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          ${error ? "border-red-500" : "border-white/10 focus:border-green-400/50"}
        `}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default Input;
