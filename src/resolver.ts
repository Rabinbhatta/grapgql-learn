import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { createWriteStream, WriteStream } from "fs";

const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    user: (_: any, { id }: any) =>
      prisma.user.findUnique({ where: { id: id } }),
  },
  Mutation: {
    createUser: async (_: any, args: any) => {
      const { email, name, password } = args.user;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          email: email,
          name: name,
          password: hashedPassword,
        },
      });
      return newUser;
    },
    updateUser: async (_: any, args: any) => {
      const { id, email, name } = args.user;
      const user = await prisma.user.findUnique({ where: { id: id } });
      if (!user) {
        throw new Error("User not found");
      }
      const updatedUser = await prisma.user.update({
        where: { id: id },
        data: {
          email: email,
          name: name,
        },
      });
      return updatedUser;
    },
    deleteUser: async (_: any, { id }: any) => {
      const user = await prisma.user.findUnique({ where: { id: id } });
      if (!user) {
        throw new Error("User not found");
      }
      const deletedUser = await prisma.user.delete({
        where: { id: id },
      });
      return deletedUser;
    },
    login: async (_: any, args: any) => {
      const { email, password } = args.user;
      const user = await prisma.user.findUnique({ where: { email: email } });
      if (!user) {
        throw new Error("User not found");
      }
      if (user.password !== null) {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          throw new Error("Invalid password");
        }
      }

      return user;
    },
    uploadFile: async (_: any, { file }: any) => {
      const { createReadStream, filename, mimetype } = await file;

      const filePath = `./uploads/${filename}`;
      const stream = createReadStream();

      // Calculate size while saving to disk
      let size = 0;
      const out = createWriteStream(filePath);

      stream.on("data", (chunk: any) => {
        size += chunk.length; // Accumulate size
        out.write(chunk);
      });

      finished(out);

      // Save metadata to PostgreSQL
      await prisma.file.create({
        data: {
          filename,
          mimetype,
          size, // Store calculated size
          path: filePath,
        },
      });

      return filePath; // Return the file path or URL as needed
    },
  },
};
function finished(out: WriteStream) {
  throw new Error("Function not implemented.");
}
