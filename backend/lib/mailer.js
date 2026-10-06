"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = sendVerificationEmail;
exports.sendUsernameRecoveryEmail = sendUsernameRecoveryEmail;
var nodemailer = require("nodemailer");
var microsoft_oauth_service_js_1 = require("./microsoft-oauth.service.js");
var smtpHost = process.env.SMTP_HOST;
var smtpPort = Number(process.env.SMTP_PORT);
var smtpUser = process.env.SMTP_USER;
var mailFrom = process.env.MAIL_FROM;
if (!smtpHost) {
    throw new Error("SMTP_HOST is missing from environment variables");
}
if (!smtpPort || Number.isNaN(smtpPort)) {
    throw new Error("SMTP_PORT is missing or invalid");
}
if (!smtpUser) {
    throw new Error("SMTP_USER is missing from environment variables");
}
if (!mailFrom) {
    throw new Error("MAIL_FROM is missing from environment variables");
}
function createMailer() {
    return __awaiter(this, void 0, void 0, function () {
        var accessToken;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, microsoft_oauth_service_js_1.getMicrosoftAccessToken)()];
                case 1:
                    accessToken = _a.sent();
                    return [2 /*return*/, nodemailer.createTransport({
                            host: smtpHost,
                            port: smtpPort,
                            secure: false,
                            requireTLS: true,
                            auth: {
                                type: "OAuth2",
                                user: smtpUser,
                                accessToken: accessToken,
                            },
                        })];
            }
        });
    });
}
/*
* security improvement: if username validation ever becomes loose enough
* this function will act as a helper to prevent
* */
function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function sendVerificationEmail(to, code) {
    return __awaiter(this, void 0, void 0, function () {
        var appName, mailer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    appName = "Garbo";
                    return [4 /*yield*/, createMailer()];
                case 1:
                    mailer = _a.sent();
                    return [4 /*yield*/, mailer.sendMail({
                            from: mailFrom,
                            to: to,
                            subject: "Verify your ".concat(appName, " email address"),
                            // Plain-text fallback
                            text: "".concat(appName, " Automated Email Services\n\n        Please verify your email address\n        \n        We want to say thanks for signing up and creating your ").concat(appName, " account.\n        ").concat(appName, " is here to help organize your inbox.\n        \n        Enter the verification code below to finish setting up your account:\n        \n        ").concat(code, "\n        \n        This code expires in 10 minutes.\n        \n        If you didn't create a ").concat(appName, " account, you can safely ignore this email.\n        \n        \u00A9 2026 ").concat(appName, "\n        \n        thegarbagebot.com\n                ").trim(),
                            // HTML version
                            html: "\n        <!DOCTYPE html>\n        \n        <html lang=\"en\">\n        \n        <head>\n            <meta charset=\"UTF-8\">\n        \n            <meta\n                name=\"viewport\"\n                content=\"width=device-width, initial-scale=1.0\"\n            >\n        \n            <title>\n                Verify your Garbo email address\n            </title>\n        </head>\n        \n        <body style=\"\n            margin: 0;\n            padding: 0;\n            background-color: #f4f4f4;\n            font-family: Arial, Helvetica, sans-serif;\n            color: #1f2937;\n        \">\n        \n            <!-- Main email background -->\n            <table\n                role=\"presentation\"\n                style=\"\n                    width: 100%;\n                    border-spacing: 0;\n                    border-collapse: collapse;\n                    background-color: #f4f4f4;\n                \"\n            >\n        \n                <tr>\n        \n                    <td style=\"\n                        padding: 40px 15px;\n                        text-align: center;\n                    \">\n        \n                        <!-- Email container -->\n                        <table\n                            role=\"presentation\"\n                            style=\"\n                                width: 100%;\n                                max-width: 600px;\n                                margin: 0 auto;\n                                border-spacing: 0;\n                                border-collapse: separate;\n                                background-color: #ffffff;\n                                border-radius: 12px;\n                                overflow: hidden;\n                            \"\n                        >\n        \n                            <!-- Garbo Header -->\n                            <tr>\n        \n                                <td style=\"\n                                    padding: 32px 30px 20px;\n                                    background-color: #ffffff;\n                                    text-align: center;\n                                \">\n        \n                                    <h1 style=\"\n                                        margin: 0;\n                                        font-size: 28px;\n                                        color: #1f2937;\n                                    \">\n                                        Garbo Automated Email Services\n                                    </h1>\n        \n                                </td>\n        \n                            </tr>\n        \n                            <!-- Email Content -->\n                            <tr>\n        \n                                <td style=\"\n                                    padding: 20px 40px 40px;\n                                    text-align: left;\n                                \">\n        \n                                    <h2 style=\"\n                                        margin: 0 0 24px;\n                                        text-align: center;\n                                        font-size: 24px;\n                                        color: #111827;\n                                    \">\n                                        Please verify your email address\n                                    </h2>\n        \n                                    <p style=\"\n                                        margin: 0 0 18px;\n                                        font-size: 16px;\n                                        line-height: 1.6;\n                                    \">\n                                        We want to say thanks for signing up\n                                        and creating your Garbo account.\n                                        Garbo is here to help you stay\n                                        organized with your inbox.\n                                    </p>\n        \n                                    <p style=\"\n                                        margin: 0 0 28px;\n                                        font-size: 16px;\n                                        line-height: 1.6;\n                                    \">\n                                        Enter the verification code below\n                                        to finish setting up your account:\n                                    </p>\n        \n                                    <!-- Verification Code -->\n                                    <div style=\"\n                                        margin: 30px 0;\n                                        text-align: center;\n                                    \">\n        \n                                        <span style=\"\n                                            display: inline-block;\n                                            padding: 16px 28px;\n                                            background-color: #f3f4f6;\n                                            border-radius: 8px;\n                                            font-size: 32px;\n                                            font-weight: bold;\n                                            letter-spacing: 8px;\n                                            color: #111827;\n                                        \">\n                                            ".concat(code, "\n                                        </span>\n        \n                                    </div>\n        \n                                    <p style=\"\n                                        margin: 28px 0 12px;\n                                        text-align: center;\n                                        font-size: 14px;\n                                        color: #6b7280;\n                                    \">\n                                        This code expires in\n                                        <strong>10 minutes</strong>.\n                                    </p>\n        \n                                    <p style=\"\n                                        margin: 30px 0 0;\n                                        font-size: 14px;\n                                        line-height: 1.6;\n                                        color: #6b7280;\n                                    \">\n                                        If you didn't create a Garbo account,\n                                        you can safely ignore this email.\n                                    </p>\n        \n                                </td>\n        \n                            </tr>\n        \n                            <!-- Footer -->\n                            <tr>\n        \n                                <td style=\"\n                                    padding: 25px 30px;\n                                    border-top: 1px solid #e5e7eb;\n                                    background-color: #f9fafb;\n                                    text-align: center;\n                                \">\n        \n                                    <p style=\"\n                                        margin: 0 0 8px;\n                                        font-size: 13px;\n                                        color: #6b7280;\n                                    \">\n                                        \u00A9 2026 Garbo\n                                    </p>\n        \n                                    <p style=\"\n                                        margin: 0;\n                                        font-size: 13px;\n                                    \">\n        \n                                        <a\n                                            href=\"https://www.thegarbagebot.com\"\n                                            style=\"\n                                                color: #4b5563;\n                                                text-decoration: none;\n                                            \"\n                                        >\n                                            www.thegarbagebot.com\n                                        </a>\n        \n                                    </p>\n        \n                                </td>\n        \n                            </tr>\n        \n                        </table>\n        \n                    </td>\n        \n                </tr>\n        \n            </table>\n        \n        </body>\n        \n        </html>").trim(),
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function sendUsernameRecoveryEmail(email, username) {
    return __awaiter(this, void 0, void 0, function () {
        var appName, mailer, safeUsername, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    appName = "Garbo";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, createMailer()];
                case 2:
                    mailer = _a.sent();
                    safeUsername = escapeHtml(username);
                    return [4 /*yield*/, mailer.sendMail({
                            from: mailFrom,
                            to: email,
                            subject: "".concat(appName, " Username Recovery"),
                            text: "Hello, you recently requested help recovering your ".concat(appName, " username.\n\n             Your username is:\n  \n            ").concat(username, "\n            \n            You can now return to ").concat(appName, " and log in using this username.\n            \n            If you did not request your username, you can safely ignore this email.\n            \n            // add a report button so users may report discrepancies with their account\n            // add link back to login form\n            \n            \u2014 ").concat(appName).trim(),
                            html: "\n        <!DOCTYPE html>\n        <html lang=\"en\">\n        <head>\n            <meta charset=\"UTF-8\">\n\n            <meta\n                name=\"viewport\"\n                content=\"width=device-width, initial-scale=1.0\"\n            >\n\n            <title>\n                ".concat(appName, " Username Recovery\n            </title>\n        </head>\n\n        <body style=\"\n            margin: 0;\n            padding: 0;\n            background-color: #f4f4f4;\n            font-family: Arial, Helvetica, sans-serif;\n            color: #1f2937;\n        \">\n\n            <!-- Main email background -->\n            <table\n                role=\"presentation\"\n                style=\"\n                    width: 100%;\n                    border-spacing: 0;\n                    border-collapse: collapse;\n                    background-color: #f4f4f4;\n                \"\n            >\n\n                <tr>\n                    <td style=\"\n                        padding: 40px 15px;\n                        text-align: center;\n                    \">\n                        <!-- Email container -->\n                        <table\n                            role=\"presentation\"\n                            style=\"\n                                width: 100%;\n                                max-width: 600px;\n                                margin: 0 auto;\n                                border-spacing: 0;\n                                border-collapse: separate;\n                                background-color: #ffffff;\n                                border-radius: 12px;\n                                overflow: hidden;\n                            \"\n                        >\n                            <!-- Garbo Header -->\n                            <tr>\n                                <td style=\"\n                                    padding: 32px 30px 20px;\n                                    background-color: #ffffff;\n                                    text-align: center;\n                                \">\n                                    <h1 style=\"\n                                        margin: 0;\n                                        font-size: 28px;\n                                        color: #1f2937;\n                                    \">\n                                        Garbo Automated Email Services\n                                    </h1>\n                                </td>\n                            </tr>\n                            <!-- Email Content -->\n                            <tr>\n                                <td style=\"\n                                    padding: 20px 40px 40px;\n                                    text-align: left;\n                                \">\n                                    <h2 style=\"\n                                        margin: 0 0 24px;\n                                        text-align: center;\n                                        font-size: 24px;\n                                        color: #111827;\n                                    \">\n                                        ").concat(appName, " Username Recovery\n                                    </h2>\n\n                                    <p style=\"\n                                        margin: 0 0 18px;\n                                        font-size: 16px;\n                                        line-height: 1.6;\n                                    \">\n                                        You recently requested help recovering your ").concat(appName, " username.\n                                    </p>\n\n                                    <p style=\"\n                                        margin: 0 0 28px;\n                                        font-size: 16px;\n                                        line-height: 1.6;\n                                    \">\n                                        Your username is:\n                                    </p>\n\n                                    <!-- Username matched with email -->\n                                    <div style=\"\n                                        margin: 30px 0;\n                                        text-align: center;\n                                    \">\n\n                                        <span style=\"\n                                            display: inline-block;\n                                            padding: 16px 28px;\n                                            background-color: #f3f4f6;\n                                            border-radius: 8px;\n                                            font-size: 32px;\n                                            font-weight: bold;\n                                            letter-spacing: 8px;\n                                            color: #111827;\n                                        \">\n\n                                            ").concat(safeUsername, "\n\n                                        </span>\n\n                                    </div>\n\n                                    <p style=\"\n                                        margin: 28px 0 12px;\n                                        text-align: center;\n                                        font-size: 14px;\n                                        color: #6b7280;\n                                    \">\n                                       You can now return to ").concat(appName, " and log in using this username.\n                                    </p>\n\n                                    <p style=\"\n                                        margin: 30px 0 0;\n                                        font-size: 14px;\n                                        line-height: 1.6;\n                                        color: #6b7280;\n                                    \">\n                                        If you did not request your username, you can safely ignore this email.\n                                    </p>\n\n                                </td>\n\n                            </tr>\n\n                            <!-- Footer -->\n                            <tr>\n\n                                <td style=\"\n                                    padding: 25px 30px;\n                                    border-top: 1px solid #e5e7eb;\n                                    background-color: #f9fafb;\n                                    text-align: center;\n                                \">\n\n                                    <p style=\"\n                                        margin: 0 0 8px;\n                                        font-size: 13px;\n                                        color: #6b7280;\n                                    \">\n                                        \u00A9 2026 Garbo\n                                    </p>\n\n                                    <p style=\"\n                                        margin: 0;\n                                        font-size: 13px;\n                                    \">\n\n                                        <a\n                                            href=\"https://www.thegarbagebot.com\"\n                                            style=\"\n                                                color: #4b5563;\n                                                text-decoration: none;\n                                            \"\n                                        >\n                                            www.thegarbagebot.com\n                                        </a>\n\n                                    </p>\n\n                                </td>\n\n                            </tr>\n\n                        </table>\n\n                    </td>\n\n                </tr>\n\n            </table>\n\n        </body>\n\n        </html>").trim(),
                        })];
                case 3:
                    _a.sent();
                    console.log("Username recovery email sent to ".concat(email));
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    console.error("Unable to send username recovery email:", err_1);
                    throw err_1;
                case 5: return [2 /*return*/];
            }
        });
    });
}
