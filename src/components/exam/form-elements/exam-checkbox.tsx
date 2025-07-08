
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"

import { cn } from "@/lib/utils"
import { InteractivePassage, type Annotation, type PassageProps } from "../interactive-passage"

const ExamCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & { label: string, passageProps: PassageProps }
>(({ className, label, passageProps, ...props }, ref) => (
  <label className="flex items-center gap-2 font-exam text-sm cursor-pointer select-none">
    <CheckboxPrimitive.Root
        ref={ref}
        style={{ width: '16px', height: '16px' }}
        className={cn(
        "peer shrink-0 border border-exam-border-light ring-offset-background",
        "hover:border-exam-green",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-exam-green data-[state=checked]:border-exam-green data-[state=checked]:border-2 data-[state=checked]:text-white",
        className
        )}
        {...props}
    >
        <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current font-bold")}
        >
        ✓
        </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
    <InteractivePassage text={label} as="span" id={`checkbox-label-${props.id}`} {...passageProps} />
  </label>
))
ExamCheckbox.displayName = CheckboxPrimitive.Root.displayName

export { ExamCheckbox }
