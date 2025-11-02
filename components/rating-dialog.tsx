"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

export type RatingTarget = {
  kind: "song" | "activity"
  title: string
  meta?: Record<string, any>
}

type RatingDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: RatingTarget | null
  onSubmit: (rating: number) => void
}

export function RatingDialog({ open, onOpenChange, target, onSubmit }: RatingDialogProps) {
  const [value, setValue] = useState<number>(0)
  const [hoverValue, setHoverValue] = useState<number>(0)

  useEffect(() => {
    if (open) {
      setValue(0)
      setHoverValue(0)
    }
  }, [open])

  const handleStarClick = (rating: number) => {
    setValue(rating)
  }

  const displayValue = hoverValue || value

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white text-gray-900 border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">
            Rate this {target?.kind === "song" ? "song" : "activity"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            How helpful/enjoyable was: <span className="font-medium">{target?.title}</span>?
          </div>
          
          <div className="flex items-center justify-center gap-2 py-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHoverValue(star)}
                onMouseLeave={() => setHoverValue(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`h-10 w-10 transition-colors ${
                    star <= displayValue
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
                  }`}
                />
              </button>
            ))}
          </div>
          
          {displayValue > 0 && (
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              {displayValue} {displayValue === 1 ? 'star' : 'stars'}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (value > 0) {
                onSubmit(value)
                onOpenChange(false)
              }
            }}
            disabled={value === 0}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RatingDialog


