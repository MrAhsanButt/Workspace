import React, { useState, useEffect } from 'react'
import { Button } from 'antd'
import { ArrowRight, Laptop } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const VerifyOTP = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || 'user@example.com'

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (otp.length < 4) {
      return window.toast?.('Please enter your verification code', 'error')
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      window.toast?.('Email verified successfully! You can sign in.', 'success')
      navigate('/auth/login')
    }, 400)
  }

  const handleResend = () => {
    window.toast?.('A new code has been sent to your email', 'info')
    setOtp('')
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 text-slate-900">
      <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-6 md:p-8 shadow-sm space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Laptop className="w-3.5 h-3.5" />
            </div>
            <span>
              Our<span className="text-blue-600">Space</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900 pt-1">Verify your email</h1>
          <p className="text-xs text-slate-500">
            We sent a verification code to <span className="text-slate-800 font-medium">{email}</span>.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            autoFocus
            className="w-full h-12 rounded-lg bg-slate-50 border border-slate-200 text-center text-xl font-bold tracking-[0.4em] text-slate-900 outline-none transition-colors focus:border-blue-500 focus:bg-white"
          />

          <Button
            htmlType="submit"
            loading={loading}
            className="w-full! h-10! flex! items-center! justify-center! gap-2! border-none! rounded-lg! bg-blue-600! text-white! font-semibold! text-xs! hover:bg-blue-700! shadow-xs!"
          >
            <span>Verify & Continue</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleResend}
            className="text-blue-600 hover:underline font-medium cursor-pointer"
          >
            Resend Code
          </button>
          <Link to="/auth/register" className="hover:text-slate-900">
            Change email
          </Link>
        </div>
      </div>
    </div>
  )
}

export default VerifyOTP