import { Component, ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "danger";
};

export default function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  const colorClass = variant === "danger"
    ? "bg-red-500 hover:bg-red-600"
    : "bg-blue-500 hover:bg-blue-600";

  return (
    <button
      className={`rounded ${colorClass} px-4 py-2 text-white font-bold disabled:opacity-50`}
      {...props}
    >
      {props.children}
    </button>
  );
}