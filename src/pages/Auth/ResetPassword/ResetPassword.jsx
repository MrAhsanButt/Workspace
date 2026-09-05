import React, { useState } from 'react'
import { Button } from 'antd'
import { ArrowRight, Laptop, Lock } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password.length < 4) {
      return window.toast?.('Password must be at least 4 characters', 'error')
    }
    if (password !== confirmPassword) {
      return window.toast?.('Passwords do not match', 'error')
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      window.toast?.('Password has been reset successfully! You can sign in.', 'success')
      navigate('/auth/login')
    }, 400)
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 text-slate-900">
      <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-6 md:p-8 shadow-sm space-y-5">
        <div className="text-center space-y-1.5">
          <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Laptop className="w-3.5 h-3.5" />
            </div>
            <span>
              Our<span className="text-blue-600">Space</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900 pt-1">New Password</h1>
          <p className="text-xs text-slate-500">
            Set your new workspace password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-10 pl-10 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none transition-colors focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full h-10 pl-10 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none transition-colors focus:border-blue-500 focus:bg-white"
            />
          </div>

          <Button
            htmlType="submit"
            loading={loading}
            className="w-full! h-10! flex! items-center! justify-center! gap-2! border-none! rounded-lg! bg-blue-600! text-white! font-semibold! text-xs! hover:bg-blue-700! shadow-xs! mt-2!"
          >
            <span>Update Password</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <Link to="/auth/login" className="text-xs text-slate-500 hover:text-blue-600 font-medium">
            Cancel & back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword