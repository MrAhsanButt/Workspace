import { useAuth } from "@/context/AuthContext"
import { Navigate } from "react-router-dom"

const PrivateRoutes = ({ Component }) => {
    const { isAuth } = useAuth()
    if (!isAuth) { return <Navigate to='/auth/login' /> }

    return <Component />
}

export default PrivateRoutes
