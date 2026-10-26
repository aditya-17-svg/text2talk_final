export default function FieldError({ e }) {
  if (!e) {
    return null;
  }
  return (
    <p
      role="alert"
      className="mt-1 text-xs text-red-600"
    >
      {e.message}
    </p>
  );
}
