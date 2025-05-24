import { createContext, ReactNode, useEffect, useState } from "react"
import { User, userDB } from "./db-service"

interface UserContextType {
  user: User | null
  loading: boolean
  error: Error | null
  updateUser: (user: User) => Promise<void>
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      setLoading(true)
      const currentUser = await userDB.get()
      if (currentUser) {
        setUser(currentUser)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load user"))
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (updatedUser: User) => {
    try {
      setLoading(true)
      // Update the database first
      const savedUser = await userDB.update(updatedUser)
      // Then update the state with the saved user
      setUser(savedUser)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update user"))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    error,
    updateUser,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}