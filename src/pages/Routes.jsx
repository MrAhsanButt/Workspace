import PageNotFound from '@/components/PageNotFound'
import PrivateRoutes from '@/components/PrivateRoutes'
import { useAuth } from '@/context/AuthContext'
import { Navigate, Route, Routes } from 'react-router-dom'
import Auth from './Auth/Auth'
import Dashboard from './Dashboard/Dashboard'
import Frontend from './Frontend/Frontend'

const Index = () => {
    const { isAuth } = useAuth()
    return (
        <Routes>
            <Route path="/*" element={<Frontend />} />
            <Route path="/workspace" element={<PrivateRoutes Component={Dashboard} />} />
            <Route path="/dashboard" element={<Navigate to="/workspace" replace />} />
            <Route path="/auth/*" element={isAuth ? <Navigate to='/' /> : <Auth />} />
            <Route path="*" element={<PageNotFound />} />
        </Routes>
    )
}

export default Index
