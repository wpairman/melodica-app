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

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

// Initialize state safely
if (typeof window !== 'undefined') {
  // Only initialize on client side
  memoryState = { toasts: [] }
}

// Ensure listeners array is always available
if (!listeners) {
  // This should never happen, but just in case
  console.warn('Toast listeners array was not initialized')
}

// Safe dispatch function
function dispatch(action: Action) {
  // SSR safety check
  if (typeof window === 'undefined') return
  
  try {
    memoryState = reducer(memoryState, action)
    listeners.forEach((listener) => {
      try {
        listener(memoryState)
      } catch (error) {
        console.error('Error in toast listener:', error)
      }
    })
  } catch (error) {
    console.error('Error in toast dispatch:', error)
  }
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  // SSR safety check
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
  // Initialize with safe defaults
  const [state, setState] = React.useState<State>(() => {
    // Always return a safe initial state
    return { toasts: [] }
  })

  const [isMounted, setIsMounted] = React.useState(false)
  const [isInitialized, setIsInitialized] = React.useState(false)

  React.useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    setIsMounted(true)

    // Initialize with current memory state if available
    if (memoryState && memoryState.toasts) {
      setState(memoryState)
    }

    // Safety check for listeners array
    if (listeners && Array.isArray(listeners)) {
      listeners.push(setState)
      setIsInitialized(true)
    }

    return () => {
      if (listeners && Array.isArray(listeners)) {
        const index = listeners.indexOf(setState)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    }
  }, []) // Empty dependency array to prevent re-running

  const safeToast = React.useCallback((props: Toast) => {
    if (!isMounted || !isInitialized || typeof window === 'undefined') {
      return { id: 'ssr-placeholder', dismiss: () => {}, update: () => {} }
    }
    
    try {
      return toast(props)
    } catch (error) {
      console.error('Error in safeToast:', error)
      return { id: 'error-placeholder', dismiss: () => {}, update: () => {} }
    }
  }, [isMounted, isInitialized])

  const safeDismiss = React.useCallback((toastId?: string) => {
    if (!isMounted || !isInitialized || typeof window === 'undefined') return
    
    try {
      dispatch({ type: "DISMISS_TOAST", toastId })
    } catch (error) {
      console.error('Error in safeDismiss:', error)
    }
  }, [isMounted, isInitialized])

  return {
    ...state,
    toast: safeToast,
    dismiss: safeDismiss,
  }
}

export { useToast, toast }
