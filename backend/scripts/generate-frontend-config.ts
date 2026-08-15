require("dotenv").config();

import * as fs from "fs";
import * as path from "path";
const port = process.env.PORT;

if (!port) {
  throw new Error("PORT must be defined in backend/.env");
}

const apiBaseUrl = `http://localhost:${port}`;

/*
 * AUTO-GENERATED FILE.
 * Do not edit manually.
 */
const output = `export const API_BASE_URL = ${JSON.stringify(apiBaseUrl)};`.trimStart();


const outputPath = path.resolve(process.cwd(), "../src/ts/api-config.ts");

fs.writeFileSync(outputPath, output, "utf8");

console.log("Frontend API configuration generated.");