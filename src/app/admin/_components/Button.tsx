type ButtonProps = {
  type?: "submit" | "button";
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "danger";
  children: React.ReactNode;
};

export default function Button({
  type = "button",
  onClick,
  disabled,
  variant = "primary",
  children
}: ButtonProps) {
  const colorClass = variant === "danger"
    ? "bg-red-500 hover:bg-red-600"
    : "bg-blue-500 hover:bg-blue-600";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded ${colorClass} px-4 py-2 text-white font-bold disabled:opacity-50`}
    >
      {children}
    </button>
  );
}