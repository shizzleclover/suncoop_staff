import { Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'

export function LoadingSpinner({ 
  size = 'default', 
  className, 
  text,
  fullScreen = false 
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const spinner = (
    <div className={cn(
      "flex items-center justify-center",
      fullScreen && "min-h-[50vh]",
      className
    )}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className={cn(
          "animate-spin text-primary",
          sizeClasses[size]
        )} />
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}

export function LoadingButton({ 
  children, 
  isLoading, 
  disabled, 
  className, 
  ...props 
}) {
  return (
    <button
      disabled={isLoading || disabled}
      className={cn(
        "inline-flex items-center justify-center",
        isLoading && "cursor-not-allowed opacity-70",
        className
      )}
      {...props}
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {children}
    </button>
  )
}

export function LoadingCard({ className, children }) {
  return (
    <div className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}>
      <div className="p-6 flex items-center justify-center">
        <LoadingSpinner text="Loading..." />
      </div>
      {children}
    </div>
  )
}

// Loading state for data tables
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div
              key={j}
              className="h-4 bg-muted rounded animate-pulse flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Loading skeleton for cards
export function CardSkeleton({ className }) {
  return (
    <div className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}>
      <div className="p-6">
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
          <div className="h-8 bg-muted rounded animate-pulse w-1/2" />
          <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
        </div>
      </div>
    </div>
  )
} 