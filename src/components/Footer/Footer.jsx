import React from 'react'
import { Laptop } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-500 py-8 px-6 text-xs">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white">
            <Laptop className="w-3 h-3" />
          </div>
          <span>
            Our<span className="text-blue-600">Space</span>
          </span>
          <span className="text-slate-400 font-normal text-xs ml-2">
            — Simple Workspace & Todo Manager
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-500 text-xs">
          <Link to="/workspace" className="hover:text-slate-900 transition-colors">
            Workspace
          </Link>
          <Link to="/auth/login" className="hover:text-slate-900 transition-colors">
            Login
          </Link>
          <span>© {new Date().getFullYear()} OurSpace</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
