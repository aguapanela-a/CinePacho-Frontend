import React from 'react'

export default function MovieCardSkeleton() {
  return (
    <div className="group relative bg-surface rounded-2xl overflow-hidden border border-border/50">
      {/* Poster area skeleton */}
      <div className="relative aspect-[2/3] overflow-hidden bg-carbon">
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent z-10" />
      </div>

      {/* Details area skeleton */}
      <div className="p-4 bg-surface space-y-3">
        <div className="h-6 bg-white/10 rounded-md w-3/4 animate-pulse-slow" />
        <div className="h-4 bg-white/5 rounded-md w-1/2 animate-pulse-slow" />
      </div>
    </div>
  )
}
