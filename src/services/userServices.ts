import { Login, User } from "../graphql/types/type";
import { tokenGenerator } from "../middleware/middleware";
import prisma from "../prismaClient";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class UserService {
  async createUser(user: User) {
    const { email, name, password, confirmPassword } = user;

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    const existedUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existedUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email: email,
        name: name,
        password: hashedPassword,
      },
    });
    return {
      success: true,
      message: "User created successfully",
      statusCode: 201,
    };
  }

  async login(user: Login) {
    const { email, password } = user;
    const existedUser: User | any = await prisma.user.findUnique({
      where: { email },
    });

    if (!existedUser) {
      throw new Error("Email does not exist");
    }

    if (existedUser.password !== null) {
      const isValidPassword = await bcrypt.compare(
        password,
        existedUser.password
      );
      if (!isValidPassword) {
        throw new Error("Invalid password");
      }
    }

    const token = tokenGenerator({
      id: existedUser.id,
      name: existedUser.name,
      email: existedUser.email,
    });

    return {
      success: true,
      message: "Login successful",
      statusCode: 200,
      token: token,
    };
  }
}

export const userService = new UserService();
