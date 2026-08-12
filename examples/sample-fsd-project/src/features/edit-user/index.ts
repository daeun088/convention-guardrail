import type { User } from '../../entities/user/index.js';

export function editUserName(user: User, name: string): User {
  return { ...user, name };
}
