import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ArrowRight, Layout, Folders, Zap } from 'lucide-react'

const Hero = () => {
  const { isAuth } = useAuth()

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 text-slate-900">
      <div className="max-w-2xl mx-auto text-center space-y-5 sm:space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <span>Simple Workspace & Todo App</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
          Work together, <br />
          <span className="text-blue-600">effortlessly.</span>
        </h1>

        <p className="max-w-lg mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
          Manage projects, organize Kanban boards, track subtasks, and collaborate with role-based permissions.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/workspace"
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors shadow-xs"
          >
            <span>Open Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {!isAuth && (
            <Link
              to="/auth/login"
              className="px-6 py-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors shadow-xs"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Features Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-8 text-left">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <Layout className="w-4 h-4 text-blue-600 mb-1.5" />
            <div className="font-semibold text-slate-900 text-xs">Board, List & Calendar</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Multiple views of tasks</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <Folders className="w-4 h-4 text-purple-600 mb-1.5" />
            <div className="font-semibold text-slate-900 text-xs">Workspaces & Roles</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Owner, Admin, Member, Viewer</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <Zap className="w-4 h-4 text-emerald-600 mb-1.5" />
            <div className="font-semibold text-slate-900 text-xs">Local & Offline Sync</div>
            <div className="text-[11px] text-slate-500 mt-0.5">JSON backup & export</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
