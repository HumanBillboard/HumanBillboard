"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

/**
 * ProfileDisplayField - Reusable read-only field component
 * Implements composition pattern for consistent display styling
 * High Cohesion: Focused solely on displaying profile data
 */
export interface ProfileDisplayFieldProps {
  label: string
  value: string | null | undefined
  colSpan?: boolean
}

export function ProfileDisplayField({
  label,
  value,
  colSpan,
}: ProfileDisplayFieldProps) {
  return (
    <div className={colSpan ? "col-span-2 md:col-span-1" : ""}>
      <div className="grid gap-2">
        <Label className="text-xs font-semibold text-[#D9D9D9]/70">
          {label}
        </Label>
        <p className="text-[#D9D9D9]">{value || "—"}</p>
      </div>
    </div>
  )
}

/**
 * ProfileViewMode - Displays profile in read-only state
 * Implements presentation pattern for view-only UI
 * Low Coupling: Generic across profile types via render prop
 */
export interface ProfileViewModeProps {
  children: React.ReactNode
  onEditClick: () => void
}

export function ProfileViewMode({
  children,
  onEditClick,
}: ProfileViewModeProps) {
  return (
    <div className="space-y-4">
      {children}
      <Button
        onClick={onEditClick}
        className="mt-6 w-full bg-[#8BFF61] text-[#171717] hover:bg-[#8BFF61]/90"
      >
        Edit Profile
      </Button>
    </div>
  )
}

/**
 * ProfileEditMode - Renders profile form in editable state
 * Implements composition for flexible form layout
 * Open/Closed Principle: Extensible via render prop without modification
 */
export interface ProfileEditModeProps {
  isLoading: boolean
  error: string | null
  onCancel: () => void
  children: React.ReactNode
}

export function ProfileEditMode({
  isLoading,
  error,
  onCancel,
  children,
}: ProfileEditModeProps) {
  return (
    <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
      <CardContent className="pt-6">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-4">
            {children}

            {error && (
              <div className="rounded bg-red-500/10 p-3 text-sm text-red-500">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-[#8BFF61] text-[#171717] hover:bg-[#8BFF61]/90 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                disabled={isLoading}
                className="flex-1 border-[#D9D9D9]/20 text-[#D9D9D9] hover:bg-[#D9D9D9]/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

/**
 * ProfileFormField - Generic reusable input field component
 * Implements composite pattern for DRY input handling
 * Single Responsibility: Manages one field's state and rendering
 */
export interface ProfileFormFieldProps {
  id: string
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  maxLength?: number
  rows?: number
  isTextarea?: boolean
  colSpan?: boolean
}

export function ProfileFormField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  maxLength,
  rows,
  isTextarea,
  colSpan,
}: ProfileFormFieldProps) {
  const Component = isTextarea ? "textarea" : "input"

  const commonClasses =
    "border-[#D9D9D9]/20 bg-[#171717] text-[#D9D9D9] placeholder:text-[#D9D9D9]/50"

  return (
    <div className={colSpan ? "col-span-2 md:col-span-1" : ""}>
      <div className="grid gap-2">
        <Label htmlFor={id} className="text-[#D9D9D9]">
          {label}
        </Label>
        {isTextarea ? (
          <textarea
            id={id}
            placeholder={placeholder}
            required
            rows={rows || 4}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={maxLength}
            className={`rounded-[5px] border px-3 py-2 ${commonClasses}`}
          />
        ) : (
          <input
            id={id}
            type={type}
            placeholder={placeholder}
            required
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={maxLength}
            className={`rounded-[5px] border px-3 py-2 ${commonClasses}`}
          />
        )}
      </div>
    </div>
  )
}
