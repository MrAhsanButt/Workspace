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
    const [savedAccounts, setSavedAccounts] = useState([])

    // Load saved accounts from localStorage
    const loadAccounts = () => {
        const accounts = JSON.parse(localStorage.getItem('accounts')) || []
        setSavedAccounts(accounts)
    }

    // Persist an account into the accounts list (no duplicates by email)
    const saveAccountToList = (user) => {
        const accounts = JSON.parse(localStorage.getItem('accounts')) || []
        const exists = accounts.some((a) => a.email === user.email)
        if (!exists) {
            const updated = [...accounts, user]
            localStorage.setItem('accounts', JSON.stringify(updated))
            setSavedAccounts(updated)
        } else {
            setSavedAccounts(accounts)
        }
    }

    const readProfile = () => {
        const stored = JSON.parse(localStorage.getItem('user'))
        if (stored) {
            const user = stored.user ?? stored
            dispatch({ type: 'SET_LOGIN', payload: { user } })
            saveAccountToList(user)
        }
        loadAccounts()
        setIsAppLoading(false)
    }

    const handleLogout = () => {
        localStorage.removeItem('user')
        dispatch({ type: 'SET_LOGOUT' })
    }

    // Switch to a different saved account
    const switchAccount = (account) => {
        dispatch({ type: 'SET_LOGIN', payload: { user: account } })
        localStorage.setItem('user', JSON.stringify({ user: account }))
        window.toast?.(`Switched to ${account.fullName || account.name}`, 'success')
    }

    useEffect(() => {
        readProfile()
    }, [])

    return (
        <Auth.Provider value={{ ...state, dispatch, handleLogout, isAppLoading, savedAccounts, switchAccount, saveAccountToList }}>
            {children}
        </Auth.Provider>
    )
}

export const useAuth = () => useContext(Auth)
export default AuthContext
