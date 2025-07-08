
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

interface ExamRadioGroupItemProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  label: string;
  passageProps: PassageProps;
  variant?: 'default' | 'button';
  isCorrect?: boolean;
  isSelected?: boolean;
}


const ExamRadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  ExamRadioGroupItemProps
>(({ className, label, passageProps, variant = 'default', isCorrect, isSelected, ...props }, ref) => {
  if (variant === 'button') {
    return (
       <RadioGroupPrimitive.Item
        ref={ref}
        asChild
        {...props}
       >
         <label className={cn(
             "flex h-9 cursor-pointer select-none items-center justify-center rounded-[4px] border border-exam-border-light bg-white px-4 py-1 text-sm font-semibold transition-colors",
             "hover:border-exam-green hover:bg-green-50",
             "focus:border-exam-green focus:outline-none focus:shadow-[0_0_3px_rgba(76,175,80,0.3)]",
             "disabled:cursor-not-allowed disabled:opacity-50",
             isSelected && !isCorrect && "border-destructive bg-red-100 text-destructive",
             isCorrect && "border-green-500 bg-green-100 text-green-800",
             isSelected && !isCorrect && "border-destructive",
             className
         )}>
            {label}
         </label>
       </RadioGroupPrimitive.Item>
    )
  }
  
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
                "data-[state=checked]:bg-white data-[state=checked]:border-exam-green data-[state=checked]:border-2"
            )}
            {...props}
        >
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                 <div className="h-2.5 w-2.5 rounded-full bg-exam-green" />
            </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
        <InteractivePassage text={label} as="span" id={`radio-label-${props.id}`} {...passageProps}/>
    </label>
  )
})
ExamRadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { ExamRadioGroup, ExamRadioGroupItem }

    
