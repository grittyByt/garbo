import "dotenv/config";
import express from "express";
import { forgotUsernameHandler } from "./controllers/auth.controller.js";

const app = express();

// Allows Express to read JSON from Postman
app.use(express.json());

app.post("/api/auth/forgot-username", forgotUsernameHandler);

const PORT = process.env.PORT;

if (!PORT) {
    throw new Error("PORT is missing from environment variables");
}

app.listen(Number(PORT), () => {
    console.log(`Forgot Username test server running on port ${PORT}`);
});