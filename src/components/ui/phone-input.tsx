"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface PhoneInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const [localError, setLocalError] = React.useState<string | null>(null);

    const formatDisplay = (val: string) => {
      if (!val) return "";
      if (!val.startsWith("+62")) return val;
      
      const suffix = val.slice(3);
      if (!suffix) return "+62";
      
      let formatted = "+62 ";
      for (let i = 0; i < suffix.length; i++) {
        if (i > 0 && (i === 3 || i === 7)) {
          formatted += " ";
        }
        formatted += suffix[i];
      }
      return formatted;
    };

    const validate = (val: string) => {
      if (!val) return null;
      const rawValue = val.replace(/\s/g, "");
      if (!rawValue.startsWith("+62")) return "Harus dimulai dengan +62";
      const suffix = rawValue.slice(3);
      if (suffix.length > 0 && !/^\d+$/.test(suffix)) return "Hanya boleh berisi angka";
      if (suffix.length > 0 && (suffix.length < 10 || suffix.length > 12)) return "Panjang nomor harus 10-12 digit setelah +62";
      return null;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\s/g, ""); // Always work with raw value
      
      // Auto prefix +62 logic
      if (val === "0") val = "+62";
      else if (val.startsWith("0")) val = "+62" + val.slice(1);
      else if (val === "6") val = "+62";
      else if (val.startsWith("62") && !val.startsWith("+")) val = "+" + val;
      else if (val !== "" && !val.startsWith("+")) {
          val = "+62" + val.replace(/\D/g, '');
      }

      // Filter non-digits from suffix
      if (val.length > 3) {
          const prefix = val.slice(0, 3);
          const suffix = val.slice(3).replace(/\D/g, '');
          val = prefix + suffix;
      }

      onChange(val);
      setLocalError(validate(val));
    };

    // Initial validation
    React.useEffect(() => {
        setLocalError(validate(value));
    }, [value]);

    return (
      <div className="space-y-1 w-full">
        <Input
          {...props}
          ref={ref}
          value={formatDisplay(value) || ""}
          onChange={handleChange}
          placeholder="+62 ____ ____ ____"
          className={cn(localError && "border-red-500 focus-visible:ring-red-500", className)}
        />
        {localError && <p className="text-[11px] text-red-500 font-medium px-1 italic">{localError}</p>}
      </div>
    );
  }
);
PhoneInput.displayName = "PhoneInput";
