import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI must be set within .env");
  }

  const start = performance.now();
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  const elapsed = Math.round(performance.now() - start);

  const db = mongoose.connection.db?.databaseName ?? mongoose.connection.name ?? "unknown";
  const host = mongoose.connection.host ?? "unknown";
  const port = mongoose.connection.port;
  const hostDisplay = port ? `${host}:${port}` : host;

  console.log(
    `OK: Connected to MongoDB [db="${db}", host=${hostDisplay}, time=${elapsed}ms]`
  );
}

connectToDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });
