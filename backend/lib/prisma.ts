import { PrismaClient } from "@prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";
import * as process from "node:process";

// constant will process new data from this database url
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({adapter});