"use client"

import { cn } from "@/lib/utils"

interface RetroFormFieldProps {
  id: string
  label: string
  type?: string
  placeholder?: string
  value: string | number
  onChange: (value: any) => void
  options?: { value: string | number; label: string }[]
  className?: string
  required?: boolean
  min?: number
  max?: number
}

export function RetroFormField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  options,
  className,
  required = false,
  min,
  max,
}: RetroFormFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label htmlFor={id} className="block text-sm font-medium">
        {label} {required && <span className="text-[#00ff00]">*</span>}
      </label>

      {type === "select" && options ? (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#0b3d0b] border-2 border-[#00ff00] p-2 text-[#00ff00] focus:outline-none focus:ring-2 focus:ring-[#00ff00]/50"
          required={required}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#0b3d0b] border-2 border-[#00ff00] p-2 text-[#00ff00] focus:outline-none focus:ring-2 focus:ring-[#00ff00]/50 min-h-[80px]"
          required={required}
        />
      ) : type === "checkbox" ? (
        <div className="flex items-center">
          <input
            id={id}
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="w-5 h-5 bg-[#0b3d0b] border-2 border-[#00ff00] text-[#00ff00] focus:outline-none focus:ring-2 focus:ring-[#00ff00]/50"
          />
          <span className="ml-2 text-sm">{placeholder}</span>
        </div>
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#0b3d0b] border-2 border-[#00ff00] p-2 text-[#00ff00] focus:outline-none focus:ring-2 focus:ring-[#00ff00]/50"
          required={required}
          min={min}
          max={max}
        />
      )}
    </div>
  )
}
