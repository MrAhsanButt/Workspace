import React, { useState } from 'react'
import { Button, Form, Input } from 'antd'
import { Laptop, Lock, Mail, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const initialState = { fullName: '', email: '', password: '', confirmPassword: '', role: 'member' }

const Register = () => {
  const [state, setState] = useState(initialState)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setState({ ...state, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    const { fullName, email, password, confirmPassword, role } = state

    if (fullName.trim().length < 2) {
      return window.toast('Please enter your full name!', 'error')
    }

    if (!window.isValidEmail(email)) {
      return window.toast('Please enter a valid email address!', 'error')
    }

    if (password.length < 4) {
      return window.toast('Password must be at least 4 characters!', 'error')
    }

    if (password !== confirmPassword) {
      return window.toast('Passwords do not match!', 'error')
    }

    const userData = { fullName, email, password, role }
    const users = JSON.parse(localStorage.getItem('users')) || []

    setLoading(true)
    try {
      if (users.some((u) => u.email === email)) {
        return window.toast('Email already registered!', 'error')
      }
      users.push(userData)
      localStorage.setItem('users', JSON.stringify(users))
      window.toast('Registered successfully! You can sign in now.', 'success')
      navigate('/auth/login', { state: { email, password } })
    } catch (error) {
      console.log(error)
      window.toast('Registration failed!', 'error')
    } finally {
      setTimeout(() => setLoading(false), 300)
    }
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
          <h1 className="text-xl font-bold text-slate-900 pt-1">Create an account</h1>
          <p className="text-xs text-slate-500">Get started with your workspace.</p>
        </div>

        {/* Form */}
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-3">
          <Form.Item label={<span className="text-xs font-medium text-slate-600">Full Name</span>} className="mb-2!">
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Alex Morgan"
                name="fullName"
                onChange={handleChange}
                className="pl-10! py-2! rounded-lg! bg-slate-50! border-slate-200! text-slate-900! placeholder:text-slate-400! text-xs!"
              />
            </div>
          </Form.Item>

          <Form.Item label={<span className="text-xs font-medium text-slate-600">Email Address</span>} className="mb-2!">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="email"
                placeholder="you@example.com"
                name="email"
                onChange={handleChange}
                className="pl-10! py-2! rounded-lg! bg-slate-50! border-slate-200! text-slate-900! placeholder:text-slate-400! text-xs!"
              />
            </div>
          </Form.Item>

          <Form.Item label={<span className="text-xs font-medium text-slate-600">Password</span>} className="mb-2!">
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input.Password
                placeholder="••••••••"
                name="password"
                onChange={handleChange}
                className="pl-10! py-2! rounded-lg! bg-slate-50! border-slate-200! text-slate-900! placeholder:text-slate-400! text-xs!"
              />
            </div>
          </Form.Item>

          <Form.Item label={<span className="text-xs font-medium text-slate-600">Confirm Password</span>} className="mb-4!">
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input.Password
                placeholder="••••••••"
                name="confirmPassword"
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
            Create Account
          </Button>
        </Form>

        <p className="text-center text-xs text-slate-500 pt-1">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-blue-600 hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
