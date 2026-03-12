export type AuthUser = {
  id: string;
  email: string;
  role: 'startup' | 'investor' | 'admin';
  emailVerified: boolean;
};

export type SignUpInput = {
  email: string;
  password: string;
  role: 'startup' | 'investor';
};

export type SignInInput = {
  email: string;
  password: string;
};

export type ConfirmSignUpInput = {
  email: string;
  code: string;
};

export type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};
