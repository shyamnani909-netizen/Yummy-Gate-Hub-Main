import { createFileRoute } from "@tanstack/react-router";
import { getMongoConfig, pingMongo } from "@/server/db";

export const Route = createFileRoute("/api/db/health")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const result = await pingMongo();
          return Response.json({
            status: "connected",
            database: result.dbName,
            uri: result.uri,
          });
        } catch (error) {
          const { uri, dbName } = getMongoConfig();
          return Response.json(
            {
              status: "disconnected",
              database: dbName,
              uri,
              message: error instanceof Error ? error.message : "MongoDB is not reachable.",
            },
            { status: 503 },
          );
        }
      },
    },
  },
});
