
"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"

import { cn } from "@/lib/utils"
import { InteractivePassage, type Annotation, type PassageProps } from "../interactive-passage"

const ExamRadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("flex flex-col", className)}
      {...props}
      ref={ref}
    />
  )
})
ExamRadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const ExamRadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & { label: string; passageProps: PassageProps }
>(({ className, label, passageProps, ...props }, ref) => {
  return (
    <label className="flex items-center gap-2 font-exam text-sm cursor-pointer select-none">
        <RadioGroupPrimitive.Item
            ref={ref}
            style={{ width: '16px', height: '16px' }}
            className={cn(
                "flex-shrink-0 rounded-full border border-exam-border-light",
                "hover:border-exam-green",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "data-[state=checked]:bg-exam-green data-[state=checked]:border-exam-green data-[state=checked]:border-2",
                className
            )}
            {...props}
        >
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                {/* The background color change serves as the indicator */}
            </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
        <InteractivePassage text={label} as="span" id={`radio-label-${props.id}`} {...passageProps}/>
    </label>
  )
})
ExamRadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { ExamRadioGroup, ExamRadioGroupItem }
