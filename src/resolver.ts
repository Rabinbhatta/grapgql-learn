import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import cloudinary from "../cloudinary"; // Assuming cloudinary is configured properly
import fs from "fs";

const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    user: (_: any, { id }: any) =>
      prisma.user.findUnique({ where: { id: id } }),
    files: async () => {
      // Fetch all uploaded files from the database
      return await prisma.file.findMany();
    },
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
    uploadFile: async (_: any, file: any) => {
      const { createReadStream, filename, mimetype, encoding } = await file
        .file[0].file;
      const stream = createReadStream();

      // Return a promise to handle asynchronous behavior properly
      return new Promise((resolve, reject) => {
        // Upload the file to Cloudinary
        const uploadStream: any = cloudinary.uploader.upload_stream(
          { resource_type: "auto" },
          async (error, result: any) => {
            if (error) {
              console.error("Error uploading file to Cloudinary:", error);
              return reject(new Error("File upload failed"));
            }

            // Cloudinary provides the file URL
            const fileUrl = result.secure_url;

            // Save the file information to the database
            try {
              const fileData = await prisma.file.create({
                data: {
                  filename: filename,
                  path: fileUrl, // Store the Cloudinary URL in the database
                  mimetype: mimetype, // Store mimetype if needed
                },
              });

              // Return the saved file data
              resolve(fileData);
            } catch (dbError) {
              console.error("Error saving file to database:", dbError);
              reject(new Error("Failed to save file information to database"));
            }
          }
        );

        // Pipe the file stream to Cloudinary
        stream.pipe(uploadStream);
      });
    },
  },
};
