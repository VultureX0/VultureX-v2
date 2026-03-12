export type AuthUser = {
  id: string;
  email: string;
  role: 'startup' | 'investor' | 'admin';
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
