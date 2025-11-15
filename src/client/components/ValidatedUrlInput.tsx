import { ValidateUrlResponse } from "@api/playlist-sources/playlist-sources.types";
import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

interface ValidatedUrlInputProps {
  value: string;
  onChange: (value: string, validationResult?: ValidateUrlResponse) => void;
  placeholder?: string;
  disabled?: boolean;
}

type ValidationState = "idle" | "validating" | "valid" | "invalid";

export const ValidatedUrlInput = ({
  value,
  onChange,
  placeholder = "Enter URL (Reddit or RSS feed)",
  disabled = false,
}: ValidatedUrlInputProps) => {
  const [validationState, setValidationState] =
    useState<ValidationState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const validateUrl = async (url: string) => {
    if (!url || url.trim() === "") {
      setValidationState("idle");
      setErrorMessage("");
      return;
    }

    setValidationState("validating");
    setErrorMessage("");

    try {
      const response = await api.post<ValidateUrlResponse>(
        "/playlist-sources/validate-url",
        { url },
      );

      if (response.data.valid) {
        setValidationState("valid");
        onChange(url, response.data);
      } else {
        setValidationState("invalid");
        setErrorMessage(response.data.error || "Invalid URL");
        onChange(url);
      }
    } catch {
      setValidationState("invalid");
      setErrorMessage("Failed to validate URL");
      onChange(url);
    }
  };

  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounce
    debounceTimerRef.current = setTimeout(() => {
      validateUrl(value);
    }, 300);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const getInputClassName = () => {
    const baseClasses = "input";
    switch (validationState) {
      case "valid":
        return `${baseClasses} input-success`;
      case "invalid":
        return `${baseClasses} input-error`;
      default:
        return baseClasses;
    }
  };

  const renderIcon = () => {
    switch (validationState) {
      case "validating":
        return (
          <span className="loading loading-spinner loading-sm opacity-50"></span>
        );
      case "valid":
        return (
          <svg
            className="h-[1em] text-success"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        );
      case "invalid":
        return (
          <svg
            className="h-[1em] text-error"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      default:
        return (
          <svg
            className="h-[1em] opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2.5"
              fill="none"
              stroke="currentColor"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </g>
          </svg>
        );
    }
  };

  return (
    <div>
      <label className={getInputClassName()}>
        {renderIcon()}
        <input
          type="url"
          className="grow"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          disabled={disabled}
        />
      </label>
      {validationState === "invalid" && errorMessage && (
        <p className="text-error text-sm mt-1">{errorMessage}</p>
      )}
    </div>
  );
};
