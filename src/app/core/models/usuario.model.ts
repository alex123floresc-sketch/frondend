export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiraEnMs: number;
  username: string;
  nombre: string;
  roles: string[];
}

export interface UsuarioActual {
  username: string;
  nombre: string;
  roles: string[];
}
