import { createContext, useContext, useEffect, useReducer, useState } from "react"

export const Auth = createContext()

const initialState = { isAuth: false, user: {} }

const reducer = (state, { type, payload }) => {
    switch (type) {
        case 'SET_LOGIN':
            return { isAuth: true, user: payload.user }
        case 'SET_LOGOUT':
            return initialState
        default:
            return state

    }
}

const AuthContext = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState)
    const [isAppLoading, setIsAppLoading] = useState(true)

    const readProfile = () => {
        const user = JSON.parse(localStorage.getItem('user'))
        if (user) {
            dispatch({ type: 'SET_LOGIN', payload: { user } })
        }
        setIsAppLoading(false)
    }

    const handleLogout = () => {
        localStorage.removeItem('user')
        dispatch({ type: 'SET_LOGOUT' })
    }

    useEffect(() => {
        readProfile()
    }, [])



    return (
        <Auth.Provider value={{ ...state, dispatch, handleLogout, isAppLoading }}>
            {children}
        </Auth.Provider>
    )
}
export const useAuth = () => useContext(Auth)
export default AuthContext
