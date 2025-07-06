import { User } from '@livetracking/shared';
import { Injectable } from '@nestjs/common';

interface UserWithPassword extends User {
  password: string;
}

@Injectable()
export class UserService {
  // This is a mock user service for demonstration purposes.
  private users: UserWithPassword[] = [
    {
      id: 1,
      email: 'demo@example.com',
      name: 'Demo User',
      password: 'password',
    },
  ];

  findByEmail(email: string): UserWithPassword | undefined {
    return this.users.find((user) => user.email === email);
  }
}
