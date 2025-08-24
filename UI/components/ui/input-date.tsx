// File: components/ui/input-date.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { format, parse } from "date-fns";

interface DateInputProps {
  value?: Date;
  onChange: (date: Date | undefined, error?: string) => void;
  disabled?: boolean;
}

export function DateInput({ value, onChange, disabled }: DateInputProps) {
  const [text, setText] = useState(value ? format(value, "dd/MM/yyyy") : "");

  const handleChange = (val: string) => {
    // Chỉ cho phép số và "/"
    let clean = val.replace(/[^\d]/g, "");

    // Thêm dấu "/" tự động
    if (clean.length > 2 && clean.length <= 4) {
      clean = clean.slice(0, 2) + "/" + clean.slice(2);
    } else if (clean.length > 4) {
      clean = clean.slice(0, 2) + "/" + clean.slice(2, 4) + "/" + clean.slice(4);
    }

    setText(clean);
  };

  const handleBlur = () => {
    if (!text.trim()) {
      onChange(undefined, "");
      return;
    }

    const parsed = parse(text, "dd/MM/yyyy", new Date());
    const [day, month, year] = text.split("/").map(Number);

    if (
      isNaN(parsed.getTime()) ||
      parsed.getDate() !== day ||
      parsed.getMonth() + 1 !== month ||
      parsed.getFullYear() !== year
    ) {
      onChange(undefined, "Ngày không chuẩn format");
      return;
    }

    onChange(parsed, "");
  };

  return (
    <Input
      type="text"
      placeholder="dd/mm/yyyy"
      value={text}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      disabled={disabled}
      maxLength={10} //  dd/MM/yyyy
    />
  );
}
