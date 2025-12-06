import React, { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import api from '@/lib/api'

interface User {
    username: string
    sub: number
    userId: number
    rol: string
    iat: number
    exp: number
}

interface AuthContextType {
    user: User | null
    token: string | null
    login: (token: string) => void
    logout: () => void
    isAuthenticated: boolean
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode<User>(token)
                // Optionally check for expiration
                if (decoded.exp * 1000 < Date.now()) {
                    logout()
                } else {
                    setUser(decoded)
                    // Set axios default header just in case, though interceptor handles it
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
                }
            } catch (error) {
                console.error("Invalid token", error)
                logout()
            }
        } else {
            setUser(null)
            delete api.defaults.headers.common['Authorization']
        }
        setIsLoading(false)
    }, [token])

    const login = (newToken: string) => {
        localStorage.setItem('token', newToken)
        setToken(newToken)
        setIsLoading(false) // Assuming instant login validity
    }

    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        setIsLoading(false)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                isAuthenticated: !!user,
                isLoading
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
