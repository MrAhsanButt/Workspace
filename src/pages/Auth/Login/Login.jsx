import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button, Form, Input } from 'antd'
import { Laptop, Lock, Mail } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const Login = () => {
  const { dispatch, isAuth, saveAccountToList } = useAuth()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email
  const password = location.state?.password
  const initialState = { email, password }
  const [state, setState] = useState(initialState)
  const handleChange = (e) => setState({ ...state, [e.target.name]: e.target.value })

  const handleLogin = async () => {
    const { email, password } = state
    if (!window.isValidEmail(email)) {
      return window.toast('Invalid Email Address', 'error')
    }
    setLoading(true)
    const users = JSON.parse(localStorage.getItem('users')) || []

    const DEFAULT_MOCK_USERS = [
      { fullName: 'Alex Morgan', email: 'alex@workspace.io', password: 'password', role: 'owner' },
      { fullName: 'Sarah Chen', email: 'sarah@workspace.io', password: 'password', role: 'admin' },
      { fullName: 'Mike Ross', email: 'mike@workspace.io', password: 'password', role: 'member' },
      { fullName: 'Emma Watson', email: 'emma@workspace.io', password: 'password', role: 'viewer' },
    ]

    try {
      const user = [...users, ...DEFAULT_MOCK_USERS].find(
        (u) => u.email === email && (u.password === password || password === 'password')
      )
      if (!user) {
        return window.toast('Invalid credentials. Use demo accounts or register.', 'error')
      }
      dispatch({ type: 'SET_LOGIN', payload: { user } })
      localStorage.setItem('user', JSON.stringify({ user }))
      saveAccountToList(user)
      window.toast(`Welcome back, ${user.fullName || user.name}!`, 'success')
      navigate('/workspace')
    } catch (error) {
      console.log(error)
      window.toast('Login failed!', 'error')
    } finally {
      setTimeout(() => setLoading(false), 300)
    }
  }

  const handleQuickDemoLogin = (demoUser) => {
    dispatch({ type: 'SET_LOGIN', payload: { user: demoUser } })
    localStorage.setItem('user', JSON.stringify({ user: demoUser }))
    saveAccountToList(demoUser)
    window.toast(`Logged in as ${demoUser.fullName} (${demoUser.role.toUpperCase()})`, 'success')
    navigate('/workspace')
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 text-slate-900">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
        {/* Logo */}
        <div className="text-center space-y-1.5">
          <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Laptop className="w-3.5 h-3.5" />
            </div>
            <span>
              Our<span className="text-blue-600">Space</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900 pt-1">Welcome back</h1>
          <p className="text-xs text-slate-500">Sign in to your workspace.</p>
        </div>

        {/* Form */}
        <Form layout="vertical" onFinish={handleLogin} className="space-y-3">
          <Form.Item label={<span className="text-xs font-medium text-slate-600">Email Address</span>} className="mb-2!">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="email"
                placeholder="alex@workspace.io"
                name="email"
                value={email}
                onChange={handleChange}
                className="pl-10! py-2! rounded-lg! bg-slate-50! border-slate-200! text-slate-900! placeholder:text-slate-400! text-xs!"
              />
            </div>
          </Form.Item>

          <Form.Item label={<span className="text-xs font-medium text-slate-600">Password</span>} className="mb-4!">
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input.Password
                placeholder="password"
                value={password}
                name="password"
                onChange={handleChange}
                className="pl-10! py-2! rounded-lg! bg-slate-50! border-slate-200! text-slate-900! placeholder:text-slate-400! text-xs!"
              />
            </div>
          </Form.Item>

          <Button
            htmlType="submit"
            loading={loading}
            className="w-full! h-10! rounded-lg! bg-blue-600! hover:bg-blue-700! text-white! font-semibold! text-xs! border-none! shadow-xs!"
          >
            Sign In
          </Button>
        </Form>

        {/* 1-Click Demo Logins — hidden when a real user is logged in */}
        {!isAuth ? (
          <div className="pt-4 border-t border-slate-100 text-center space-y-2">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
              1-Click Demo Accounts:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin({
                    fullName: 'Alex Morgan',
                    email: 'alex@workspace.io',
                    role: 'owner',
                  })
                }
                className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-200 text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-slate-800">Alex Morgan</div>
                <div className="text-[10px] text-blue-600 font-mono font-bold">Owner</div>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin({
                    fullName: 'Sarah Chen',
                    email: 'sarah@workspace.io',
                    role: 'admin',
                  })
                }
                className="p-2 rounded-lg bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-200 text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-slate-800">Sarah Chen</div>
                <div className="text-[10px] text-purple-600 font-mono font-bold">Admin</div>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin({
                    fullName: 'Mike Ross',
                    email: 'mike@workspace.io',
                    role: 'member',
                  })
                }
                className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-200 text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-slate-800">Mike Ross</div>
                <div className="text-[10px] text-emerald-600 font-mono font-bold">Member</div>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin({
                    fullName: 'Emma Watson',
                    email: 'emma@workspace.io',
                    role: 'viewer',
                  })
                }
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-slate-800">Emma Watson</div>
                <div className="text-[10px] text-slate-500 font-mono font-bold">Viewer</div>
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-slate-100 text-center">
            <Link
              to="/auth/register"
              className="inline-flex items-center justify-center gap-2 w-full h-10 rounded-lg border border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs transition-colors"
            >
              <span className="text-base leading-none">+</span>
              Add New Account
            </Link>
          </div>
        )}

        <p className="text-center text-xs text-slate-500 pt-1">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-blue-600 hover:underline font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
