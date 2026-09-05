import React from 'react'
import { Laptop } from 'lucide-react'

const Loader = ({ label = 'Loading workspace...' }) => {
  return (
    <div className="flex bg-slate-50 min-h-screen flex-col items-center justify-center gap-4 py-16 text-slate-800">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-blue-600 border-r-blue-600/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Laptop className="h-5 w-5 text-blue-600" />
        </div>
      </div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
    </div>
  )
}

export default Loader
