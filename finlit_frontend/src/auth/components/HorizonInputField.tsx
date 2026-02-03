import React from "react";

interface InputFieldProps {
  label?: string;
  id: string;
  extra?: string;
  type: string;
  placeholder?: string;
  variant?: string;
  state?: "error" | "success";
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

function InputField(props: InputFieldProps) {
  const { label, id, extra, type, placeholder, variant, state, disabled, value, onChange, onBlur } = props;

  return (
    <div className={`${extra}`}>
      {label && (
        <label
          htmlFor={id}
          className={`text-sm text-navy-700 dark:text-white ${
            variant === "auth" ? "ml-1.5 font-medium" : "ml-3 font-bold"
          }`}
        >
          {label}
        </label>
      )}
      <input
        disabled={disabled}
        type={type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`mt-2 flex h-12 w-full items-center justify-center rounded-xl border !bg-white dark:!bg-navy-800 p-3 text-sm outline-none transition-all duration-200 ${
          disabled === true
            ? "!border-none !bg-gray-100 dark:!bg-white/5 dark:placeholder:!text-[rgba(255,255,255,0.15)]"
            : state === "error"
            ? "border-red-500 text-red-500 placeholder:text-red-500 dark:!border-red-400 dark:!text-red-400 dark:placeholder:!text-red-400"
            : state === "success"
            ? "border-green-500 text-green-500 placeholder:text-green-500 dark:!border-green-400 dark:!text-green-400 dark:placeholder:!text-green-400"
            : "border-gray-200 dark:border-gray-600 text-navy-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        }`}
      />
    </div>
  );
}

export default InputField;