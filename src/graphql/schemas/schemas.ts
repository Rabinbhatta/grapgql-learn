import { gql } from "apollo-server-express";

export const typeDefs = gql`
  scalar Upload

  type User {
    id: ID!
    email: String!
    name: String!
    isVerified: Boolean
    createdAt: String!
    updatedAt: String!
  }

  type ApiResponse {
    success: Boolean!
    message: String!
    statusCode: Int!
    token: String
  }

  type File {
    id: ID!
    filename: String!
    size: Int
    path: String!
  }

  type Query {
    user(id: ID!): User
    files: [File!]!
  }

  type Mutation {
    createUser(user: CreateUserInput!): ApiResponse!
    updateUser(user: UpdateUserInput!): User
    deleteUser(id: ID!): User
    login(user: LoginInput!): ApiResponse!
    uploadFile(file: Upload!): File
  }

  input CreateUserInput {
    email: String!
    name: String!
    password: String!
    confirmPassword: String!
  }

  input UpdateUserInput {
    id: ID!
    email: String
    name: String
  }

  input LoginInput {
    email: String!
    password: String!
  }
`;
