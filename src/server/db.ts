import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/yummy-gate";
const dbName = process.env.MONGODB_DB || "yummy-gate";

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 10000,
});
let clientPromise: Promise<MongoClient> | null = null;

function getClient() {
  if (!clientPromise) {
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getDb() {
  const mongoClient = await getClient();
  return mongoClient.db(dbName);
}

export async function pingMongo() {
  const db = await getDb();
  await db.command({ ping: 1 });
  return { ok: true, uri, dbName };
}

export function getMongoConfig() {
  return { uri, dbName };
}
