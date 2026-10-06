"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
require("dotenv/config");
var prisma_1 = require("../generated/prisma");
var adapter_pg_1 = require("@prisma/adapter-pg");
var connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in the environment.");
}
var adapter = new adapter_pg_1.PrismaPg({ connectionString: connectionString });
exports.prisma = new prisma_1.PrismaClient({ adapter: adapter });
