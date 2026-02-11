import { PrismaClient } from "@prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";
import process = require("node:process");

// constant will process new data from this database url
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({adapter});