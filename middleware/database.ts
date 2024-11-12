import { MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { NextHandler } from "next-connect";

if (!process.env.DB_URL) {
  throw new Error("Please add your MongoDB URL to .env.local");
}

const client = new MongoClient(process.env.DB_URL);

async function database(
  req: NextApiRequest & { dbClient?: MongoClient; db?: any },
  res: NextApiResponse,
  next: NextHandler
) {
  if (!client.connect()) await client.connect();
  req.dbClient = client;
  req.db = client.db("ATS");
  return next();
}

export default database;