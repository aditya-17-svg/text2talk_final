export default function LanguageSelect({
  value,
  onChange,
  options,
  label,
  disabled,
  className = 'input w-auto',
}) {
  return (
    <select
      aria-label={label}
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      {options.map(([code, name]) => (
        <option
          key={code}
          value={code}
        >
          {name}
        </option>
      ))}
    </select>
  );
}
