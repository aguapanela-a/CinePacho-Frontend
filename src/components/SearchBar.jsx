import React from 'react'
import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Buscar películas, géneros, actores...' }) {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Search
        size={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-surface/80 backdrop-blur-sm border border-border/50 rounded-2xl pl-12 pr-4 py-3.5 text-text-primary placeholder-text-secondary/50 outline-none transition-all duration-300 focus:border-magenta/50 focus:ring-2 focus:ring-magenta/15 focus:bg-surface text-sm sm:text-base"
      />
    </div>
  )
}
