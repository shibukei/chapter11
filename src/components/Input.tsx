"use client";

import React from "react";

type InputProps = React.ComponentProps<"input">;

const Input: React.FC<InputProps> = ({
  className = "",
  ...props
}) => {
  return (
    <input
      className={`w-full p-2 border border-gray-300 rounded ${className}`}
      {...props}
    />
  );
};

export default Input;