import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import cloudinary from "../../../cloudinary"; // Assuming cloudinary is configured properly
import fs from "fs";
import { User } from "../types/type";
import { userService } from "../../services/userServices";

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
    createUser: async (_: any, { user }: { user: User }) => {
      try {
        const response = await userService.createUser(user);
        return response;
      } catch (error: any) {
        throw new Error("Error creating user: " + error.message);
      }
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
      try {
        const response = await userService.login(args.user);
        return response;
      } catch (error: any) {
        throw new Error("Error logging in: " + error.message);
      }
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
