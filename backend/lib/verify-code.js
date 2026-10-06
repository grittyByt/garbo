"use strict";
// Helpers: generate code, hash it, and compare
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate6DigitCode = generate6DigitCode;
exports.hashCode = hashCode;
exports.timingSafeEqualHex = timingSafeEqualHex;
var crypto = require("crypto");
function generate6DigitCode() {
    // 000000 - 999999
    var n = crypto.randomInt(0, 1000000);
    return n.toString().padStart(6, "0");
}
function hashCode(code) {
    var _a;
    // Pepper is optional but recommended:
    var pepper = (_a = process.env.VERIFICATION_CODE_PEPPER) !== null && _a !== void 0 ? _a : "";
    return crypto.createHash("sha256").update(code + pepper).digest("hex");
}
function timingSafeEqualHex(a, b) {
    var ba = Buffer.from(a, "hex");
    var bb = Buffer.from(b, "hex");
    if (ba.length !== bb.length)
        return false;
    return crypto.timingSafeEqual(ba, bb);
}
