import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { typeDefs } from "./schemas";
import { resolvers } from "./resolver";

const app = express();
const httpServer = http.createServer(app);

app.use(
  cors({
    origin: ["http://localhost:3000", "https://studio.apollographql.com"],
    credentials: true,
  })
);
app.use(express.json());
app.use(bodyParser.json());

const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: false,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

async function startServer() {
  await server.start();
  const graphqlUploadExpress = await import(
    "graphql-upload/graphqlUploadExpress.mjs"
  );
  app.use(
    graphqlUploadExpress.default({ maxFileSize: 10000000, maxFiles: 10 })
  );
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    })
  );

  httpServer.listen(4000, () => {
    console.log(`🚀 Server ready at http://localhost:4000/graphql`);
  });
}

startServer().catch(console.error);
