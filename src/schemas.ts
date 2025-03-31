import { gql } from "apollo-server-express";

export const typeDefs = gql`
  scalar Upload
  type User {
    id: ID!
    email: String!
    name: String!
    password: String!
    createdAt: String!
    updatedAt: String!
  }

  type File {
    id: ID!
    filename: String!
    size: Int!
    url: String
  }

  type Query {
    user(id: ID!): User
    files: [File!]!
  }

  type Mutation {
    createUser(user: CreateUserInput!): User
    updateUser(user: UpdateUserInput!): User
    deleteUser(id: ID!): User
    login(user: LoginInput!): User
    uploadFile(file: Upload!): File!
  }

  input CreateUserInput {
    email: String!
    name: String!
    password: String!
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
