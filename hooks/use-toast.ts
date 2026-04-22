"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

let memoryState: State = { toasts: [] }

/** All mounted useToast() subscribers must re-render when toasts change (not just the last mount). */
const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn()
    } catch (e) {
      console.error("Toast listener error:", e)
    }
  })
}

// Safe dispatch function
function dispatch(action: Action) {
  if (typeof window === "undefined") return

  try {
    memoryState = reducer(memoryState, action)
    notifyListeners()
  } catch (error) {
    console.error("Error in toast dispatch:", error)
  }
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  if (typeof window === 'undefined') {
    return {
      id: 'ssr-placeholder',
      dismiss: () => {},
      update: () => {}
    }
  }

  try {
    const id = genId()

    const update = (props: ToasterToast) =>
      dispatch({
        type: "UPDATE_TOAST",
        toast: { ...props, id },
      })
    const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

    dispatch({
      type: "ADD_TOAST",
      toast: {
        ...props,
        id,
        open: true,
        onOpenChange: (open) => {
          if (!open) dismiss()
        },
      },
    })

    return {
      id: id,
      dismiss,
      update,
    }
  } catch (error) {
    console.error('Error in toast function:', error)
    return {
      id: 'error-placeholder',
      dismiss: () => {},
      update: () => {}
    }
  }
}

function useToast() {
  const [, setUpdateCounter] = React.useState(0)
  const counterRef = React.useRef(0)

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const tick = () => {
      counterRef.current += 1
      setUpdateCounter(counterRef.current)
    }
    listeners.add(tick)
    return () => {
      listeners.delete(tick)
    }
  }, [])

  const safeToast = React.useCallback((props: Toast) => {
    if (typeof window === 'undefined') {
      return { id: 'ssr-placeholder', dismiss: () => {}, update: () => {} }
    }
    
    try {
      return toast(props)
    } catch (error) {
      console.error('Error in safeToast:', error)
      return { id: 'error-placeholder', dismiss: () => {}, update: () => {} }
    }
  }, [])

  const safeDismiss = React.useCallback((toastId?: string) => {
    if (typeof window === 'undefined') return
    
    try {
      dispatch({ type: "DISMISS_TOAST", toastId })
    } catch (error) {
      console.error('Error in safeDismiss:', error)
    }
  }, [])

  return {
    toasts: memoryState.toasts,
    toast: safeToast,
    dismiss: safeDismiss,
  }
}

export { useToast, toast }
