import type { UserEssentials } from '~/types/auth'

export const useAuth = () => {
  const user = useState<UserEssentials | null>('auth.user', () => null)
  const isAuthenticated = computed(() => !!user.value)

  const loadUserFromStorage = () => {
    if (process.client) {
      try {
        const storedUser = localStorage.getItem('current_user')
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          user.value = parsedUser
          console.log('👤 User loaded from storage:', {
            id: parsedUser.id,
            username: parsedUser.username,
            role: parsedUser.role
          })
        }
      } catch (error) {
        console.error('❌ Error loading user from storage:', error)
        clearUser()
      }
    }
  }

  const setUser = (userData: UserEssentials) => {
    user.value = userData
    if (process.client) {
      try {
        localStorage.setItem('user', JSON.stringify(userData))
        console.log('✅ User stored:', {
          id: userData.id,
          username: userData.username,
          role: userData.role
        })
      } catch (error) {
        console.error('❌ Error storing user:', error)
      }
    }
  }

  const clearUser = () => {
    user.value = null
    if (process.client) {
      localStorage.removeItem('user')
      console.log('🗑️ User cleared from storage')
    }
  }

  // Load user on composable initialization
  if (!user.value) {
    loadUserFromStorage()
  }

  return {
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    setUser,
    clearUser,
    loadUserFromStorage
  }
}
