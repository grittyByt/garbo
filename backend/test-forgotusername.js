"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var express = require("express");
var auth_controller_js_1 = require("./controllers/auth.controller.js");
var app = express();
// Allows Express to read JSON from Postman
app.use(express.json());
app.post("/api/auth/forgot-username", auth_controller_js_1.forgotUsernameHandler);
var PORT = process.env.PORT;
if (!PORT) {
    throw new Error("PORT is missing from environment variables");
}
app.listen(Number(PORT), function () {
    console.log("Forgot Username test server running on port ".concat(PORT));
});
