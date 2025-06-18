export interface UserEssentials {
  id: number
  username: string
  role: string
  hopital: {
    id: number
    nom: string
  }
}

export interface ApiUserResponse {
  id: number
  username: string
  role: string
  hopital: {
    id: number
    nom: string
    professionnels?: any[] // Avoid circular reference
  }
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  user: ApiUserResponse
  message?: string
}
