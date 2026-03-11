"use client";

import { useState } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputWithValidationProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  minLength?: number;
}

export function PasswordInputWithValidation({
  value,
  onChange,
  id = "password",
  placeholder = "Type password",
  minLength = 8,
}: PasswordInputWithValidationProps) {
  const [showPassword, setShowPassword] = useState(false);

  const rules = [
    {
      label: `${minLength} karakter minimum`,
      test: (pw: string) => pw.length >= minLength,
    },
    {
      label: "minimal 1 huruf kecil (a-z)",
      test: (pw: string) => /[a-z]/.test(pw),
    },
    {
      label: "minimal 1 huruf besar (A-Z)",
      test: (pw: string) => /[A-Z]/.test(pw),
    },
    {
      label: "minimal 1 angka (0-9)",
      test: (pw: string) => /[0-9]/.test(pw),
    },
    {
      label: "minimal 1 simbol (!@#$%^&*)",
      test: (pw: string) => /[^A-Za-z0-9]/.test(pw),
    },
  ];

  const passedRules = rules.filter((rule) => rule.test(value)).length;
  const strengthPercentage = (passedRules / rules.length) * 100;

  let strengthLabel = "Lemah";
  let barColor = "bg-red-500";

  if (value.length === 0) {
    strengthLabel = "";
    barColor = "bg-slate-200";
  } else if (passedRules <= 2) {
    strengthLabel = "Lemah";
    barColor = "bg-red-500";
  } else if (passedRules <= 4) {
    strengthLabel = "Sedang";
    barColor = "bg-orange-500";
  } else {
    strengthLabel = "Kuat";
    barColor = "bg-green-500";
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent rounded-l-none"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-slate-500" />
          ) : (
            <Eye className="h-4 w-4 text-slate-500" />
          )}
          <span className="sr-only">
            {showPassword ? "Sembunyikan password" : "Tampilkan password"}
          </span>
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-2 flex-grow bg-slate-200 rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-300", barColor)}
              style={{ width: `${strengthPercentage}%` }}
            />
          </div>
        </div>
        <div className="flex justify-end pr-1">
          <span className="text-sm font-semibold">{strengthLabel}</span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-semibold text-sm">Password harus mengandung:</p>
        <ul className="space-y-1.5">
          {rules.map((rule, index) => {
            const passed = rule.test(value);
            return (
              <li
                key={index}
                className={cn(
                  "flex items-center gap-2 text-sm",
                  passed ? "text-green-600" : "text-red-500"
                )}
              >
                {passed ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <div className="h-4 w-4 shrink-0 rounded-[4px] bg-red-500 flex items-center justify-center">
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.5 4L3.5 6L8.5 1"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
                <span>{rule.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
