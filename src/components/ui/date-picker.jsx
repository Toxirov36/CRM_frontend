import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function DatePicker({ value, onChange, className, placeholder = "Sana tanlang", captionLayout = "label", showLeftIcon = true, ...props }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef(null)

  // Parse value string (YYYY-MM-DD) into Date object
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    const parts = value.split("-")
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      const d = new Date(year, month, day)
      if (!isNaN(d.getTime())) return d
    }
    return undefined
  }, [value])

  // Format Date object back to YYYY-MM-DD string
  const handleSelect = (date) => {
    if (!date) return
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    onChange(`${year}-${month}-${day}`)
    setIsOpen(false)
  }

  // Handle click outside to close the popover
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Format date for button display (e.g., DD.MM.YYYY)
  const displayValue = React.useMemo(() => {
    if (!selectedDate) return placeholder
    const day = String(selectedDate.getDate()).padStart(2, "0")
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
    const year = selectedDate.getFullYear()
    return `${day}.${month}.${year}`
  }, [selectedDate, placeholder])

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-10 border border-gray-200 rounded-lg px-3 text-[13px] text-slate-600 outline-none focus:border-emerald-500 bg-white flex items-center justify-between text-left hover:border-emerald-400 transition-colors shadow-sm cursor-pointer",
          className
        )}
      >
        <span className="flex items-center gap-2">
          {showLeftIcon && <CalendarIcon className="size-4 text-slate-400" />}
          <span>{displayValue}</span>
        </span>
        <CalendarIcon className="size-4 text-slate-400 ml-auto opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-1 animate-in fade-in-50 slide-in-from-bottom-1 duration-150">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            captionLayout={captionLayout}
            initialFocus
            {...props}
          />
        </div>
      )}
    </div>
  )
}
