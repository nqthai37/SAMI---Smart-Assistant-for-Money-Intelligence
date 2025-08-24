import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { format, parse } from "date-fns";

interface DateInputProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
}

export function DateInput({ value, onChange, disabled }: DateInputProps) {
  const [text, setText] = useState(value ? format(value, "dd/MM/yyyy") : "");

  // Đồng bộ hiển thị khi value thay đổi
  useEffect(() => {
    setText(value ? format(value, "dd/MM/yyyy") : "");
  }, [value]);

  const handleChange = (val: string) => {
    let clean = val.replace(/[^\d]/g, "");
    if (clean.length > 2) clean = clean.slice(0, 2) + "/" + clean.slice(2);
    if (clean.length > 5) clean = clean.slice(0, 5) + "/" + clean.slice(5);
    if (clean.length > 10) clean = clean.slice(0, 10);
    setText(clean);
  };

  const handleBlur = () => {
    if (!text.trim()) {
      onChange(undefined);
      return;
    }
    const parsed = parse(text, "dd/MM/yyyy", new Date());
    if (!isNaN(parsed.getTime())) {
      onChange(parsed);
    } else {
      onChange(undefined);
      setText("");
    }
  };

  return (
    <Input
      type="text"
      placeholder="dd/mm/yyyy"
      value={text}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      disabled={disabled}
      maxLength={10}
    />
  );
}
