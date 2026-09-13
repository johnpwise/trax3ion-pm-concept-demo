export type UserRole = "project-manager" | "user";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  resourceId?: string;
};
