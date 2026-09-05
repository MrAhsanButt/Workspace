import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'

const PageNotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl mb-4 border border-blue-100 shadow-xs">
        404
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Page Not Found</h1>
      <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-sm">
        The page you are looking for might have been moved, removed, or is temporarily unavailable.
      </p>
      <div className="flex items-center gap-3 mt-6">
        <Link
          to="/workspace"
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Go to Workspace</span>
        </Link>
        <Link
          to="/"
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  )
}

export default PageNotFound