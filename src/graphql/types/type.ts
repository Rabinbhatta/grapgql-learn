export interface User {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export interface Login {
  email: string;
  password: string;
}
