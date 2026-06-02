import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import bcrypt from "bcryptjs";
import { getDb, getMongoConfig } from "@/server/db";

export type StoredUser = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

const usersPath = join(process.cwd(), ".data", "auth-users.json");
const useMongo =
  typeof process.env.MONGODB_URI === "string" && process.env.MONGODB_URI.trim() !== "";

async function getUsersCollection() {
  const db = await getDb();
  return db.collection<StoredUser>("authUsers");
}

async function getUsersCollectionOrNull() {
  if (!useMongo) return null;

  try {
    return await getUsersCollection();
  } catch (error) {
    const { uri, dbName } = getMongoConfig();
    console.warn(
      `MongoDB is configured (${uri}, database ${dbName}) but is not reachable. Falling back to .data/auth-users.json.`,
      error,
    );
    return null;
  }
}

async function readUsers() {
  const collection = await getUsersCollectionOrNull();
  if (collection) {
    return collection.find().toArray();
  }

  try {
    const raw = await readFile(usersPath, "utf8");
    return JSON.parse(raw) as StoredUser[];
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeUsers(users: StoredUser[]) {
  const collection = await getUsersCollectionOrNull();
  if (collection) {
    await collection.deleteMany({});
    if (users.length > 0) {
      await collection.insertMany(users);
    }
    return;
  }

  await mkdir(dirname(usersPath), { recursive: true });
  await writeFile(usersPath, JSON.stringify(users, null, 2), "utf8");
}

export async function createAuthUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const collection = await getUsersCollectionOrNull();

  if (collection) {
    const existing = await collection.findOne({ email: normalizedEmail });
    if (existing) {
      return { ok: false, message: "An account with this email already exists." };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user: StoredUser = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    await collection.insertOne(user);
    return { ok: true, user: { id: user.id, email: user.email } };
  }

  const users = await readUsers();
  if (users.some((user) => user.email === normalizedEmail)) {
    return { ok: false, message: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user: StoredUser = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  await writeUsers([...users, user]);
  return { ok: true, user: { id: user.id, email: user.email } };
}

export async function authUserExists(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const collection = await getUsersCollectionOrNull();
  if (collection) {
    return (await collection.findOne({ email: normalizedEmail })) !== null;
  }

  const users = await readUsers();
  return users.some((user) => user.email === normalizedEmail);
}

export async function validateAuthUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const collection = await getUsersCollectionOrNull();

  const user = collection
    ? await collection.findOne({ email: normalizedEmail })
    : (await readUsers()).find((item) => item.email === normalizedEmail);

  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return { id: user.id, email: user.email, name: user.email };
}
