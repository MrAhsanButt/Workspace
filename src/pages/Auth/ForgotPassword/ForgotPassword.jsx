import React, { useState } from 'react'
import { Button } from 'antd'
import { ArrowLeft, ArrowRight, Laptop, Mail } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!window.isValidEmail?.(email)) {
      return window.toast?.('Please enter a valid email address', 'error')
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      window.toast?.('Password reset instructions sent to your email', 'success')
      navigate('/auth/login')
    }, 400)
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 text-slate-900">
      <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-6 md:p-8 shadow-sm space-y-5">
        {/* Brand */}
        <div className="text-center space-y-1.5">
          <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Laptop className="w-3.5 h-3.5" />
            </div>
            <span>
              Our<span className="text-blue-600">Space</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900 pt-1">Reset Password</h1>
          <p className="text-xs text-slate-500">
            Enter your email to receive recovery instructions.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full h-10 pl-10 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:bg-white"
            />
          </div>

          <Button
            htmlType="submit"
            loading={loading}
            className="w-full! h-10! flex! items-center! justify-center! gap-2! border-none! rounded-lg! bg-blue-600! text-white! font-semibold! text-xs! hover:bg-blue-700! shadow-xs!"
          >
            <span>Send Instructions</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Back Link */}
        <div className="text-center pt-2 border-t border-slate-100">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to login</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword