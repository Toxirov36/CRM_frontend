import * as React from "react"
import { cn } from "@/lib/utils"

export function FieldGroup({ className, ...props }) {
  return (
    <div className={cn("grid gap-4", className)} {...props} />
  )
}

export function Field({ className, ...props }) {
  return (
    <div className={cn("grid gap-1.5", className)} {...props} />
  )
}
