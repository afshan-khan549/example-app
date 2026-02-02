// auth.service.test.ts
import { prismaMock } from '../mocks/prisma.mock';
jest.mock('../../app/prisma', () => ({
  prisma: prismaMock,
}));

import * as bcrypt from 'bcryptjs';
import {
  createUser,
  getCurrentUser,
  login,
  updateUser,
} from '../../app/routes/auth/auth.service';

describe('AuthService', () => {
  describe('createUser', () => {
    test('should create new user', async () => {
      const user = {
        id: 123,
        username: 'RealWorld',
        email: 'realworld@me',
        password: '1234',
      };
      const mockedResponse = {
        ...user,
        bio: null,
        image: null,
        token: '',
        demo: false,
      };

      prismaMock.user.create.mockResolvedValue(mockedResponse);

      await expect(createUser(user)).resolves.toHaveProperty('token');
    });

    test('should throw an error for empty username', async () => {
      const user = {
        id: 123,
        username: ' ',
        email: 'realworld@me',
        password: '1234',
      };
      const error = String({ errors: { username: ["can't be blank"] } });

      await expect(createUser(user)).rejects.toThrow(error);
    });

    test('should throw an error for empty email', async () => {
      const user = {
        id: 123,
        username: 'RealWorld',
        email: '  ',
        password: '1234',
      };
      const error = String({ errors: { email: ["can't be blank"] } });

      await expect(createUser(user)).rejects.toThrow(error);
    });

    test('should throw an error for empty password', async () => {
      const user = {
        id: 123,
        username: 'RealWorld',
        email: 'realworld@me',
        password: ' ',
      };
      const error = String({ errors: { password: ["can't be blank"] } });

      await expect(createUser(user)).rejects.toThrow(error);
    });

    test('should throw an error if username/email already exists', async () => {
      const user = {
        id: 123,
        username: 'RealWorld',
        email: 'realworld@me',
        password: '1234',
      };
      const mockedExistingUser = {
        ...user,
        bio: null,
        image: null,
        token: '',
        demo: false,
      };

      prismaMock.user.findUnique.mockResolvedValue(mockedExistingUser);

      const error = { email: ['has already been taken'] }.toString();
      await expect(createUser(user)).rejects.toThrow(error);
    });
  });

  describe('login', () => {
    test('should return a token', async () => {
      const user = { email: 'realworld@me', password: '1234' };
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const mockedResponse = {
        id: 123,
        username: 'RealWorld',
        email: user.email,
        password: hashedPassword,
        bio: null,
        image: null,
        token: '',
        demo: false,
      };

      prismaMock.user.findUnique.mockResolvedValue(mockedResponse);

      await expect(login(user)).resolves.toHaveProperty('token');
    });

    test('should throw for empty email', async () => {
      const user = { email: ' ', password: '1234' };
      const error = String({ errors: { email: ["can't be blank"] } });

      await expect(login(user)).rejects.toThrow(error);
    });

    test('should throw for empty password', async () => {
      const user = { email: 'realworld@me', password: ' ' };
      const error = String({ errors: { password: ["can't be blank"] } });

      await expect(login(user)).rejects.toThrow(error);
    });

    test('should throw if no user found', async () => {
      const user = { email: 'realworld@me', password: '1234' };
      prismaMock.user.findUnique.mockResolvedValue(null);

      const error = String({ errors: { 'email or password': ['is invalid'] } });
      await expect(login(user)).rejects.toThrow(error);
    });

    test('should throw if password is wrong', async () => {
      const user = { email: 'realworld@me', password: '1234' };
      const hashedPassword = await bcrypt.hash('4321', 10);
      const mockedResponse = {
        id: 123,
        username: 'Gerome',
        email: user.email,
        password: hashedPassword,
        bio: null,
        image: null,
        token: '',
        demo: false,
      };

      prismaMock.user.findUnique.mockResolvedValue(mockedResponse);

      const error = String({ errors: { 'email or password': ['is invalid'] } });
      await expect(login(user)).rejects.toThrow(error);
    });
  });

  describe('getCurrentUser', () => {
    test('should return a token', async () => {
      const id = 123;
      const mockedResponse = {
        id,
        username: 'RealWorld',
        email: 'realworld@me',
        password: '1234',
        bio: null,
        image: null,
        token: '',
        demo: false,
      };

      prismaMock.user.findUnique.mockResolvedValue(mockedResponse);

      await expect(getCurrentUser(id)).resolves.toHaveProperty('token');
    });
  });

  describe('updateUser', () => {
    test('should return a token', async () => {
      const user = {
        id: 123,
        username: 'RealWorld',
        email: 'realworld@me',
        password: '1234',
      };
      const mockedResponse = {
        ...user,
        bio: null,
        image: null,
        token: '',
        demo: false,
      };

      prismaMock.user.update.mockResolvedValue(mockedResponse);

      await expect(updateUser(user, user.id)).resolves.toHaveProperty('token');
    });
  });
});
