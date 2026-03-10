export interface User {
  id: string;
  email: string;
  preferences: {
    default_strategy?: string;
    default_num_providers?: number;
  };
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}
