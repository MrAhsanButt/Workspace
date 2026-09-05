import PageNotFound from '@/components/PageNotFound'
import { Route, Routes } from 'react-router-dom'
import ForgotPassword from './ForgotPassword/ForgotPassword'
import Login from './Login/Login'
import Register from './Register/Register'
import VerifyOTP from './Register/VerifyOTP'
import ResetPassword from './ResetPassword/ResetPassword'




const Auth = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  )
}

export default Auth
