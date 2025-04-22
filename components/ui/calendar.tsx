"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DatePicker } from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = {
  selected?: Date | null
  onChange: (date: Date | null) => void
  minDate?: Date
  maxDate?: Date
  className?: string
  placeholderText?: string
  dateFormat?: string
  showPopperArrow?: boolean
  disabled?: boolean
}

function Calendar({
  selected,
  onChange,
  minDate,
  maxDate,
  className,
  placeholderText = "Select date",
  dateFormat = "MM/dd/yyyy",
  showPopperArrow = false,
  disabled = false,
  ...props
}: CalendarProps) {
  // Memoize custom input styling
  const inputClass = React.useMemo(
    () =>
      cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      ),
    [className]
  )

  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      minDate={minDate}
      maxDate={maxDate}
      className={cn("p-3", inputClass)}
      placeholderText={placeholderText}
      dateFormat={dateFormat}
      showPopperArrow={showPopperArrow}
      disabled={disabled}
      calendarClassName="flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0"
      dayClassName={() => cn(
        buttonVariants({ variant: "ghost" }),
        "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
      )}
      monthClassName="space-y-4"
      yearClassName="flex justify-center pt-1 relative items-center"
      todayButton="flex justify-center pt-1 relative items-center"
      todayButtonClassName="text-sm font-medium"
      previousButton={<ChevronLeft className="h-4 w-4" />}
      nextButton={<ChevronRight className="h-4 w-4" />}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
