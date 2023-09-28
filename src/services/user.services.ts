import { GraphQLError } from 'graphql';
import prisma from '../handlers/prisma';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { verifyToken } from '../utils/auth.utils';

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar: string;
  otp: string;
}

interface UserLoginGoole {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

class UserService {
  public async createUser(input: User) {
    const userExisting = await prisma.users.findUnique({
      where: {
        email: input.email,
      },
    });

    if (userExisting) {
      throw new Error('Email này đã được đăng ký');
    }

    const emailOtp = await prisma.emailOtp.findUnique({
      where: {
        id: input.email,
      },
    });

    if (emailOtp?.otp !== input.otp) {
      throw new Error('Otp này không hợp lệ');
    }

    const user = await prisma.users.create({
      data: {
        id: input.id,
        email: input.email,
        name: input.name,
        password: input.password,
        avatar: input.avatar,
      },
    });

    return user;
  }

  public async login(email: string, password: string) {
    const user = await prisma.users.findUnique({
      where: {
        email: email,
        password: password,
      },
    });
    if (!user) {
      throw new Error('Could not find user');
    }

    return user;
  }

  public async LoginWithGoole(input: UserLoginGoole) {
    const userExisting = await prisma.users.findUnique({
      where: {
        email: input.email,
      },
    });

    if (userExisting) {
      return userExisting;
    }

    const user = await prisma.users.create({
      data: {
        id: input.id,
        email: input.email,
        name: input.name,
        avatar: input.avatar,
      },
    });

    return user;
  }

  public async verifyGoogle(idToken: string) {
    const decodedUser: UserRecord = await verifyToken(idToken);

    const user = {
      email: decodedUser.email,
      name: decodedUser.displayName,
      avatar: decodedUser.photoURL,
    };

    return user;
  }
}

export default new UserService();
