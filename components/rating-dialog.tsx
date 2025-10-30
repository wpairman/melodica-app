"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

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
  const [value, setValue] = useState<number>(7)

  useEffect(() => {
    if (open) setValue(7)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">
            Rate this {target?.kind === "song" ? "song" : "activity"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            How helpful/enjoyable was: <span className="font-medium">{target?.title}</span>?
          </div>
          <div className="px-1">
            <Slider value={[value]} min={1} max={10} step={1} onValueChange={(v) => setValue(v[0])} />
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Rating: {value} / 10</div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => {
              onSubmit(value)
              onOpenChange(false)
            }}
            className="bg-teal-600 hover:bg-teal-700"
          >
            Save rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RatingDialog


