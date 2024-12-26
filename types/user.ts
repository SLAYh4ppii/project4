export interface User {
  userId: string;
  username: string;
}

export interface UserWithPassword extends User {
  password: string;
}