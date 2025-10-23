"use client"

import React from 'react'
import { useToast } from '@/hooks/use-toast'

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { toast } = useToast()
  
  // This component ensures the toast context is properly initialized
  // We don't need to do anything special here, just render children
  return <>{children}</>
}

// Higher-order component to safely use toast
export function withToast<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function WrappedComponent(props: P) {
    try {
      return <Component {...props} />
    } catch (error) {
      console.error('Error in component with toast:', error)
      return <div>Error loading component</div>
    }
  }
}

// Safe toast hook wrapper
export function useSafeToast() {
  try {
    return useToast()
  } catch (error) {
    console.error('Error in useSafeToast:', error)
    return {
      toasts: [],
      toast: () => ({ id: 'error-placeholder', dismiss: () => {}, update: () => {} }),
      dismiss: () => {}
    }
  }
}
