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
exports.signupHandler = signupHandler;
exports.verifyEmailHandler = verifyEmailHandler;
exports.resendVerificationHandler = resendVerificationHandler;
exports.forgotUsernameHandler = forgotUsernameHandler;
exports.verifyForgotUsernameHandler = verifyForgotUsernameHandler;
exports.forgotPasswordHandler = forgotPasswordHandler;
exports.verifyForgotPasswordHandler = verifyForgotPasswordHandler;
exports.resetPasswordHandler = resetPasswordHandler;
// import bcrypt from "bcryptjs";
var crypto = require("crypto");
var prisma_1 = require("../lib/prisma");
var verify_code_1 = require("../lib/verify-code");
var mailer_1 = require("../lib/mailer");
var password_1 = require("../lib/password");
var CODE_TTL_MIN = 10;
var RESEND_MIN = 5;
var MAX_ATTEMPTS = 5;
var PASSWORD_RESET_TTL_MIN = 15;
function signupHandler(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, firstName, lastName, userName, eMail, password, emailRegex, normalizedEmail, userExist, passwordHash, code, codeHash, now, expiresAt, resendAfter, pendingConflict, pendingUser, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, , 8]);
                    _a = req.body, firstName = _a.firstName, lastName = _a.lastName, userName = _a.userName, eMail = _a.eMail, password = _a.password;
                    // Server-side validation (never trust browser)
                    if (!firstName || firstName.length < 2 || firstName.length > 25) {
                        // 400 = Bad request
                        /*
                         * The server cannot or will not process the request due to something that is
                         *  perceived to be a client error (e.g., malformed request syntax, invalid request
                         *  message framing, or deceptive request routing).
                        */
                        return [2 /*return*/, res.status(400).json({
                                error: "Invalid first name"
                            })];
                    }
                    if (!lastName || lastName.length < 3 || lastName.length > 25) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Invalid last name"
                            })];
                    }
                    if (!userName || userName.length < 5 || userName.length > 16) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Invalid username"
                            })];
                    }
                    emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!eMail || !emailRegex.test(eMail)) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Invalid email"
                            })];
                    }
                    normalizedEmail = eMail.trim().toLowerCase();
                    if (!password || password.length < 8 || password.length > 64) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Invalid password"
                            })];
                    }
                    return [4 /*yield*/, prisma_1.prisma.user.findFirst({
                            where: { OR: [{ eMail: normalizedEmail }, { userName: userName }] },
                            // this allows Prisma to work and sort faster by producing only the id associated
                            // with the particular user
                            select: { id: true },
                        })];
                case 1:
                    userExist = _b.sent();
                    if (userExist) {
                        // 409 = Conflict
                        // This response is sent when a request conflicts with the current state of the server.
                        return [2 /*return*/, res.status(409).json({
                                error: "Email or username is already in use"
                            })];
                    }
                    return [4 /*yield*/, (0, password_1.hashPassword)(password)];
                case 2:
                    passwordHash = _b.sent();
                    code = (0, verify_code_1.generate6DigitCode)();
                    codeHash = (0, verify_code_1.hashCode)(code);
                    now = new Date();
                    expiresAt = new Date(now.getTime() + CODE_TTL_MIN * 60000);
                    resendAfter = new Date(now.getTime() + RESEND_MIN * 60000);
                    return [4 /*yield*/, prisma_1.prisma.userPendingSignup.findFirst({
                            where: { userName: userName, NOT: { eMail: normalizedEmail } },
                            select: { id: true }
                        })];
                case 3:
                    pendingConflict = _b.sent();
                    if (pendingConflict) {
                        return [2 /*return*/, res.status(409).json({ error: "Username is already in use." })];
                    }
                    return [4 /*yield*/, prisma_1.prisma.userPendingSignup.upsert({
                            where: { eMail: normalizedEmail },
                            update: {
                                firstName: firstName,
                                lastName: lastName,
                                userName: userName,
                                passwordHash: passwordHash
                            },
                            create: {
                                firstName: firstName,
                                lastName: lastName,
                                userName: userName,
                                eMail: normalizedEmail,
                                passwordHash: passwordHash
                            },
                        })];
                case 4:
                    pendingUser = _b.sent();
                    // Create user
                    // const welcomeUser = await prisma.user.create({
                    //   data: {
                    //     firstName: firstName,
                    //     lastName: lastName,
                    //     userName: userName,
                    //     eMail: eMail,
                    //     passwordHash: passwordHash,
                    //     emailVerification: {
                    //       create: {
                    //         codeHash,
                    //         expiresAt,
                    //         resendAfter,
                    //         purpose: "SIGNUP"
                    //       },
                    //     },
                    //   },
                    //   select: { id: true, firstName: true, lastName: true, userName: true, eMail: true, emailVerification: true, createdAt: true },
                    // });
                    return [4 /*yield*/, prisma_1.prisma.emailVerificationToken.upsert({
                            where: { pendingSignupId: pendingUser.id },
                            update: {
                                purpose: "SIGNUP",
                                codeHash: codeHash,
                                expiresAt: expiresAt,
                                resendAfter: resendAfter,
                                attemptCount: 0,
                            },
                            create: {
                                purpose: "SIGNUP",
                                codeHash: codeHash,
                                expiresAt: expiresAt,
                                resendAfter: resendAfter,
                                attemptCount: 0,
                                pendingSignup: {
                                    connect: {
                                        id: pendingUser.id
                                    }
                                }
                            },
                        })];
                case 5:
                    // Create user
                    // const welcomeUser = await prisma.user.create({
                    //   data: {
                    //     firstName: firstName,
                    //     lastName: lastName,
                    //     userName: userName,
                    //     eMail: eMail,
                    //     passwordHash: passwordHash,
                    //     emailVerification: {
                    //       create: {
                    //         codeHash,
                    //         expiresAt,
                    //         resendAfter,
                    //         purpose: "SIGNUP"
                    //       },
                    //     },
                    //   },
                    //   select: { id: true, firstName: true, lastName: true, userName: true, eMail: true, emailVerification: true, createdAt: true },
                    // });
                    _b.sent();
                    return [4 /*yield*/, (0, mailer_1.sendVerificationEmail)(pendingUser.eMail, code)];
                case 6:
                    _b.sent();
                    // 201 = Created
                    /*
                    * successful response status code indicates that the HTTP request has led to
                    * the creation of a resource.
                    */
                    return [2 /*return*/, res.status(201).json({
                            ok: true,
                            needsEmailVerification: true,
                            email: pendingUser.eMail,
                            resendAvailableAt: resendAfter.toISOString(),
                        })];
                case 7:
                    err_1 = _b.sent();
                    console.error(err_1);
                    // 500 = Internal Server Issue
                    /*
                    * server error response status code indicates that the server encountered an
                    * unexpected condition that prevented it from fulfilling the request.
                    * */
                    return [2 /*return*/, res.status(500).json({ error: "Server error" })];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function verifyEmailHandler(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, email, code, normalizedEmail, pending_1, token, now, incomingHash, match, newUser, err_2;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    _a = req.body, email = _a.email, code = _a.code;
                    if (!email || !code) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Email and verifier passcode are required.",
                            })];
                    }
                    normalizedEmail = email.trim().toLowerCase();
                    return [4 /*yield*/, prisma_1.prisma.userPendingSignup.findUnique({
                            where: {
                                eMail: normalizedEmail,
                            },
                            include: {
                                emailVerification: true,
                            },
                        })];
                case 1:
                    pending_1 = _b.sent();
                    if (!pending_1) {
                        return [2 /*return*/, res.status(404).json({
                                error: "Pending signup not found.",
                            })];
                    }
                    token = pending_1.emailVerification;
                    if (!token) {
                        return [2 /*return*/, res.status(400).json({
                                error: "No verification token found.  Resend verifier passcode.",
                            })];
                    }
                    if (token.purpose !== "SIGNUP") {
                        return [2 /*return*/, res.status(400).json({
                                error: "Invalid signup verification request.",
                            })];
                    }
                    if (token.attemptCount >= MAX_ATTEMPTS) {
                        return [2 /*return*/, res.status(429).json({
                                error: "Too many failed attempts. You may request a new verifier passcode " +
                                    "after the cooldown time limit has been reached.",
                            })];
                    }
                    now = new Date();
                    if (token.expiresAt <= now) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Code has expired. Please resend a new verifier passcode.",
                            })];
                    }
                    incomingHash = (0, verify_code_1.hashCode)(code.trim());
                    match = (0, verify_code_1.timingSafeEqualHex)(incomingHash, token.codeHash);
                    if (!!match) return [3 /*break*/, 3];
                    return [4 /*yield*/, prisma_1.prisma.emailVerificationToken.update({
                            where: {
                                id: token.id,
                            },
                            data: {
                                attemptCount: {
                                    increment: 1,
                                },
                            },
                        })];
                case 2:
                    _b.sent();
                    return [2 /*return*/, res.status(400).json({
                            error: "Invalid verifier passcode. Please try again.",
                        })];
                case 3: return [4 /*yield*/, prisma_1.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                        var conflict, createdUser;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tx.user.findFirst({
                                        where: { OR: [{ eMail: pending_1.eMail }, { userName: pending_1.userName }] },
                                        select: { id: true }
                                    })];
                                case 1:
                                    conflict = _a.sent();
                                    if (conflict) {
                                        throw new Error("EMAIL_OR_USERNAME_CONFLICT");
                                    }
                                    return [4 /*yield*/, tx.user.create({
                                            data: {
                                                firstName: pending_1.firstName,
                                                lastName: pending_1.lastName,
                                                userName: pending_1.userName,
                                                eMail: pending_1.eMail,
                                                passwordHash: pending_1.passwordHash,
                                                // Since the account is only created after
                                                // successful verification:
                                                emailVerified: true,
                                                emailVerifiedAt: new Date(),
                                            },
                                            select: {
                                                publicId: true,
                                                firstName: true,
                                                lastName: true,
                                                userName: true,
                                                eMail: true,
                                                createdAt: true
                                            }
                                        })];
                                case 2:
                                    createdUser = _a.sent();
                                    return [4 /*yield*/, tx.userPendingSignup.delete({
                                            where: { id: pending_1.id }
                                        })];
                                case 3:
                                    _a.sent();
                                    return [2 /*return*/, createdUser];
                            }
                        });
                    }); })];
                case 4:
                    newUser = _b.sent();
                    return [2 /*return*/, res.status(201).json({
                            ok: true,
                            verified: true,
                            accountCreated: true,
                            user: newUser,
                            message: "Email verified. Account created successfully.",
                        })];
                case 5:
                    err_2 = _b.sent();
                    if (err_2 instanceof Error && err_2.message === "EMAIL_OR_USERNAME_CONFLICT") {
                        return [2 /*return*/, res.status(409).json({
                                error: "Email or username became unavailable before verification completed."
                            })];
                    }
                    console.error("VERIFY EMAIL ERROR:", err_2);
                    return [2 /*return*/, res.status(500).json({ error: "Server error. Please try again." })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function resendVerificationHandler(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, email, purpose_1, allowedPurposes, normalizedEmail, now, code, codeHash, expiresAt, resendAfter, pendingUser, existing_1, user, existing, err_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 8, , 9]);
                    _a = req.body, email = _a.email, purpose_1 = _a.purpose;
                    if (!email || !purpose_1) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Email and verification purpose are required."
                            })];
                    }
                    allowedPurposes = [
                        "SIGNUP",
                        "FORGOT_USERNAME",
                        "FORGOT_PASSWORD"
                    ];
                    if (!allowedPurposes.includes(purpose_1)) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Invalid verification purpose."
                            })];
                    }
                    normalizedEmail = email.trim().toLowerCase();
                    now = new Date();
                    code = (0, verify_code_1.generate6DigitCode)();
                    codeHash = (0, verify_code_1.hashCode)(code);
                    expiresAt = new Date(now.getTime() + CODE_TTL_MIN * 60000);
                    resendAfter = new Date(now.getTime() + RESEND_MIN * 60000);
                    if (!(purpose_1 === "SIGNUP")) return [3 /*break*/, 4];
                    return [4 /*yield*/, prisma_1.prisma.userPendingSignup.findUnique({
                            where: {
                                eMail: normalizedEmail
                            },
                            include: {
                                emailVerification: true
                            }
                        })];
                case 1:
                    pendingUser = _b.sent();
                    if (!pendingUser) {
                        return [2 /*return*/, res.status(404).json({
                                error: "Pending signup not found."
                            })];
                    }
                    existing_1 = pendingUser.emailVerification;
                    if (existing_1 &&
                        existing_1.resendAfter > now) {
                        return [2 /*return*/, res.status(429).json({
                                error: "Resend not available yet.",
                                resendAvailableAt: existing_1.resendAfter.toISOString()
                            })];
                    }
                    return [4 /*yield*/, prisma_1.prisma.emailVerificationToken.upsert({
                            where: {
                                pendingSignupId: pendingUser.id
                            },
                            update: {
                                purpose: "SIGNUP",
                                codeHash: codeHash,
                                expiresAt: expiresAt,
                                resendAfter: resendAfter,
                                attemptCount: 0
                            },
                            create: {
                                purpose: "SIGNUP",
                                codeHash: codeHash,
                                expiresAt: expiresAt,
                                resendAfter: resendAfter,
                                attemptCount: 0,
                                pendingSignup: {
                                    connect: {
                                        id: pendingUser.id
                                    }
                                }
                            }
                        })];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, (0, mailer_1.sendVerificationEmail)(pendingUser.eMail, code)];
                case 3:
                    _b.sent();
                    return [2 /*return*/, res.status(200).json({
                            ok: true,
                            message: "A new verification code has been sent.",
                            resendAvailableAt: resendAfter.toISOString()
                        })];
                case 4: return [4 /*yield*/, prisma_1.prisma.user.findUnique({
                        where: { eMail: normalizedEmail },
                        include: { emailVerification: true }
                    })];
                case 5:
                    user = _b.sent();
                    /*
                     * Do not reveal whether an account exists.
                     */
                    if (!user) {
                        return [2 /*return*/, res.status(200).json({
                                ok: true,
                                message: "If the account exists, a new verification code has been sent."
                            })];
                    }
                    existing = user.emailVerification.find(function (token) { return token.purpose = purpose_1; });
                    if (existing && existing.resendAfter > now) {
                        return [2 /*return*/, res.status(200).json({
                                ok: true,
                                message: "If the account exists, a verification code has been sent."
                            })];
                    }
                    return [4 /*yield*/, prisma_1.prisma.emailVerificationToken.upsert({
                            where: { userId_purpose: { userId: user.id, purpose: purpose_1 } },
                            update: {
                                purpose: purpose_1,
                                codeHash: codeHash,
                                expiresAt: expiresAt,
                                resendAfter: resendAfter,
                                attemptCount: 0
                            },
                            create: {
                                purpose: purpose_1,
                                codeHash: codeHash,
                                expiresAt: expiresAt,
                                resendAfter: resendAfter,
                                attemptCount: 0,
                                user: {
                                    connect: {
                                        id: user.id
                                    }
                                }
                            }
                        })];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, (0, mailer_1.sendVerificationEmail)(user.eMail, code)];
                case 7:
                    _b.sent();
                    return [2 /*return*/, res.status(200).json({
                            ok: true,
                            message: "If the account exists, a new verification code has been sent.",
                            resendAvailableAt: resendAfter.toISOString()
                        })];
                case 8:
                    err_3 = _b.sent();
                    console.error("RESEND VERIFICATION ERROR:", err_3);
                    return [2 /*return*/, res.status(500).json({ error: "Unable to resend verification code." })];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// POST /api/auth/forgot-username
function forgotUsernameHandler(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var email, normalizedEmail, user, code, codeHash, now, expiresAt, resendAfter, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    email = req.body.email;
                    if (!email) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Email is required."
                            })];
                    }
                    normalizedEmail = email.trim().toLowerCase();
                    return [4 /*yield*/, prisma_1.prisma.user.findUnique({
                            where: {
                                eMail: normalizedEmail
                            },
                            select: {
                                id: true,
                                eMail: true
                            }
                        })];
                case 1:
                    user = _a.sent();
                    /*
                     * Do not tell an unauthenticated visitor whether
                     * the email exists in Garbo.
                     */
                    if (!user) {
                        return [2 /*return*/, res.status(200).json({
                                ok: true,
                                message: "If an account exists for this email, a verification code has been sent."
                            })];
                    }
                    code = (0, verify_code_1.generate6DigitCode)();
                    codeHash = (0, verify_code_1.hashCode)(code);
                    now = new Date();
                    expiresAt = new Date(now.getTime() +
                        CODE_TTL_MIN * 60000);
                    resendAfter = new Date(now.getTime() +
                        RESEND_MIN * 60000);
                    return [4 /*yield*/, prisma_1.prisma.emailVerificationToken.upsert({
                            where: {
                                userId_purpose: {
                                    userId: user.id,
                                    purpose: "FORGOT_USERNAME"
                                }
                            },
                            create: {
                                purpose: "FORGOT_USERNAME",
                                codeHash: codeHash,
                                expiresAt: expiresAt,
                                resendAfter: resendAfter,
                                attemptCount: 0,
                                user: {
                                    connect: {
                                        id: user.id
                                    }
                                }
                            },
                            update: {
                                codeHash: codeHash,
                                expiresAt: expiresAt,
                                resendAfter: resendAfter,
                                attemptCount: 0,
                                purpose: "FORGOT_USERNAME"
                            }
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, mailer_1.sendVerificationEmail)(user.eMail, code)];
                case 3:
                    _a.sent();
                    return [2 /*return*/, res.status(200).json({
                            ok: true,
                            message: "If an account exists for this email, a verification code has been sent.",
                            resendAvailableAt: resendAfter.toISOString()
                        })];
                case 4:
                    err_4 = _a.sent();
                    console.error(err_4);
                    return [2 /*return*/, res.status(500).json({
                            error: "Unable to process username recovery."
                        })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// POST /api/auth/forgot-username/verify
function verifyForgotUsernameHandler(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, email, code, normalizedEmail, user, forgottenUserToken, now, incomingHash, match, err_5;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    _a = req.body, email = _a.email, code = _a.code;
                    if (!email || !code) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Email and verification code are required."
                            })];
                    }
                    normalizedEmail = email.trim().toLowerCase();
                    return [4 /*yield*/, prisma_1.prisma.user.findUnique({
                            where: { eMail: normalizedEmail },
                            select: {
                                id: true,
                                eMail: true,
                                userName: true,
                                emailVerification: {
                                    select: {
                                        id: true,
                                        purpose: true,
                                        codeHash: true,
                                        expiresAt: true,
                                        resendAfter: true,
                                        attemptCount: true
                                    }
                                }
                            }
                        })];
                case 1:
                    user = _b.sent();
                    if (!user) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Invalid or expired verification request."
                            })];
                    }
                    forgottenUserToken = user.emailVerification.find(function (verification) { return verification.purpose === "FORGOT_USERNAME"; });
                    // Make sure this code was actually issued
                    // for username recovery.
                    if (!forgottenUserToken) {
                        return [2 /*return*/, res.status(400).json({ error: "Invalid or expired verification request." })];
                    }
                    if (forgottenUserToken.attemptCount >= MAX_ATTEMPTS) {
                        return [2 /*return*/, res.status(429).json({
                                error: "Too many attempts. Please request a new code."
                            })];
                    }
                    now = new Date();
                    if (forgottenUserToken.expiresAt <= now) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Verification code expired. Please request a new code."
                            })];
                    }
                    incomingHash = (0, verify_code_1.hashCode)(code.trim());
                    match = (0, verify_code_1.timingSafeEqualHex)(incomingHash, forgottenUserToken.codeHash);
                    if (!!match) return [3 /*break*/, 3];
                    return [4 /*yield*/, prisma_1.prisma.emailVerificationToken.update({
                            where: { id: forgottenUserToken.id },
                            data: { attemptCount: { increment: 1 } }
                        })];
                case 2:
                    _b.sent();
                    return [2 /*return*/, res.status(400).json({
                            error: "Invalid verification code."
                        })];
                case 3: 
                /*
                 * Verification succeeded.
                 *
                 * Send the username to the account's
                 * registered email address.
                 */
                return [4 /*yield*/, (0, mailer_1.sendUsernameRecoveryEmail)(user.eMail, user.userName)];
                case 4:
                    /*
                     * Verification succeeded.
                     *
                     * Send the username to the account's
                     * registered email address.
                     */
                    _b.sent();
                    /*
                     * The EVC has now served its purpose.
                     */
                    return [4 /*yield*/, prisma_1.prisma.emailVerificationToken.delete({
                            where: {
                                id: forgottenUserToken.id
                            }
                        })];
                case 5:
                    /*
                     * The EVC has now served its purpose.
                     */
                    _b.sent();
                    return [2 /*return*/, res.status(200).json({
                            ok: true,
                            message: "Your username has been sent to your email."
                        })];
                case 6:
                    err_5 = _b.sent();
                    console.error(err_5);
                    return [2 /*return*/, res.status(500).json({
                            error: "Unable to verify username recovery."
                        })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// POST /api/auth/forgot-password
function forgotPasswordHandler(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var email, normalizedEmail, user, code, codeHash, now, expiresAt, resendAfter, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    email = req.body.email;
                    if (!email) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Email is required."
                            })];
                    }
                    normalizedEmail = email.trim().toLowerCase();
                    return [4 /*yield*/, prisma_1.prisma.user.findUnique({
                            where: {
                                eMail: normalizedEmail
                            },
                            select: {
                                id: true,
                                eMail: true
                            }
                        })];
                case 1:
                    user = _a.sent();
                    /*
                     * Prevent account enumeration.
                     */
                    if (!user) {
                        return [2 /*return*/, res.status(200).json({
                                ok: true,
                                message: "If an account exists for this email, a verification code has been sent."
                            })];
                    }
                    code = (0, verify_code_1.generate6DigitCode)();
                    codeHash = (0, verify_code_1.hashCode)(code);
                    now = new Date();
                    expiresAt = new Date(now.getTime() +
                        CODE_TTL_MIN * 60000);
                    resendAfter = new Date(now.getTime() +
                        RESEND_MIN * 60000);
                    return [4 /*yield*/, prisma_1.prisma.emailVerificationToken.upsert({
                            where: {
                                userId_purpose: {
                                    userId: user.id,
                                    purpose: "FORGOT_PASSWORD"
                                }
                            },
                            create: {
                                purpose: "FORGOT_PASSWORD",
                                codeHash: codeHash,
                                expiresAt: expiresAt,
                                resendAfter: resendAfter,
                                attemptCount: 0,
                                user: { connect: { id: user.id } }
                            },
                            update: {
                                codeHash: codeHash,
                                expiresAt: expiresAt,
                                resendAfter: resendAfter,
                                attemptCount: 0,
                                purpose: "FORGOT_PASSWORD"
                            }
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, mailer_1.sendVerificationEmail)(user.eMail, code)];
                case 3:
                    _a.sent();
                    return [2 /*return*/, res.status(200).json({
                            ok: true,
                            message: "If an account exists for this email, a verification code has been sent.",
                            resendAvailableAt: resendAfter.toISOString()
                        })];
                case 4:
                    err_6 = _a.sent();
                    console.error(err_6);
                    return [2 /*return*/, res.status(500).json({
                            error: "Unable to process password recovery."
                        })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Verify forgotten password code
function verifyForgotPasswordHandler(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, email, code, normalizedEmail, user, forgottenPasswordToken, now, incomingHash, match, resetToken, resetTokenHash, resetExpiresAt, err_7;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, , 8]);
                    _a = req.body, email = _a.email, code = _a.code;
                    if (!email || !code) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Email and verification code are required."
                            })];
                    }
                    normalizedEmail = email.trim().toLowerCase();
                    return [4 /*yield*/, prisma_1.prisma.user.findUnique({
                            where: { eMail: normalizedEmail },
                            select: {
                                id: true,
                                emailVerification: {
                                    select: {
                                        id: true,
                                        purpose: true,
                                        codeHash: true,
                                        expiresAt: true,
                                        resendAfter: true,
                                        attemptCount: true
                                    }
                                }
                            }
                        })];
                case 1:
                    user = _b.sent();
                    if (!user) {
                        return [2 /*return*/, res.status(400).json({ error: "Invalid or expired verification request." })];
                    }
                    forgottenPasswordToken = user.emailVerification.find(function (token) { return token.purpose === "FORGOT_PASSWORD"; });
                    if (!forgottenPasswordToken) {
                        return [2 /*return*/, res.status(400).json({ error: "Invalid or expired verification request." })];
                    }
                    /*
                
                     * Prevent additional attempts once the
                
                     * maximum number has been reached.
                
                     */
                    if (forgottenPasswordToken.attemptCount >= MAX_ATTEMPTS) {
                        return [2 /*return*/, res.status(429).json({
                                error: "Too many attempts. Please request a new code."
                            })];
                    }
                    now = new Date();
                    /*
                
                     * Make sure the verification code has
                
                     * not expired.
                
                     */
                    if (forgottenPasswordToken.expiresAt <= now) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Verification code expired. Please request a new code."
                            })];
                    }
                    incomingHash = (0, verify_code_1.hashCode)(code.trim());
                    match = (0, verify_code_1.timingSafeEqualHex)(incomingHash, forgottenPasswordToken.codeHash);
                    if (!!match) return [3 /*break*/, 3];
                    return [4 /*yield*/, prisma_1.prisma.emailVerificationToken.update({
                            where: { id: forgottenPasswordToken.id },
                            data: { attemptCount: { increment: 1 } }
                        })];
                case 2:
                    _b.sent();
                    return [2 /*return*/, res.status(400).json({ error: "Invalid verification code." })];
                case 3:
                    resetToken = crypto.randomBytes(32).toString("hex");
                    resetTokenHash = (0, verify_code_1.hashCode)(resetToken);
                    resetExpiresAt = new Date(now.getTime() + PASSWORD_RESET_TTL_MIN * 60000);
                    /*
                
                     * Remove old unused reset tokens for
                
                     * this user before creating another.
                
                     */
                    return [4 /*yield*/, prisma_1.prisma.pWResetToken.deleteMany({
                            where: { userId: user.id, usedAt: null }
                        })];
                case 4:
                    /*
                
                     * Remove old unused reset tokens for
                
                     * this user before creating another.
                
                     */
                    _b.sent();
                    return [4 /*yield*/, prisma_1.prisma.pWResetToken.create({
                            data: {
                                userId: user.id,
                                tokenHash: resetTokenHash,
                                expiresAt: resetExpiresAt
                            }
                        })];
                case 5:
                    _b.sent();
                    /*
                
                     * The FORGOT_PASSWORD verification token
                
                     * has served its purpose and cannot be reused.
                
                     *
                
                     * Delete this exact token rather than every
                
                     * verification token belonging to the user.
                
                     */
                    return [4 /*yield*/, prisma_1.prisma.emailVerificationToken.delete({
                            where: { id: forgottenPasswordToken.id }
                        })];
                case 6:
                    /*
                
                     * The FORGOT_PASSWORD verification token
                
                     * has served its purpose and cannot be reused.
                
                     *
                
                     * Delete this exact token rather than every
                
                     * verification token belonging to the user.
                
                     */
                    _b.sent();
                    return [2 /*return*/, res.status(200).json({
                            ok: true,
                            verified: true,
                            resetToken: resetToken,
                            resetTokenExpiresAt: resetExpiresAt.toISOString(),
                            message: "Email verified. You may now create a new password."
                        })];
                case 7:
                    err_7 = _b.sent();
                    console.error("VERIFY FORGOT PASSWORD ERROR:", err_7);
                    return [2 /*return*/, res.status(500).json({
                            error: "Unable to verify password recovery."
                        })];
                case 8: return [2 /*return*/];
            }
        });
    });
}
// POST /api/auth/reset-password
function resetPasswordHandler(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, resetToken, password, tokenHash, reset, now, passwordHash, err_8;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    _a = req.body, resetToken = _a.resetToken, password = _a.password;
                    if (!resetToken ||
                        !password) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Reset token and new password are required."
                            })];
                    }
                    /*
                     * Use your same password rules from signup.
                     *
                     * You can make this stricter later by moving
                     * password validation into one reusable helper.
                     */
                    if (password.length < 8 ||
                        password.length > 64) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Invalid password."
                            })];
                    }
                    tokenHash = (0, verify_code_1.hashCode)(resetToken.trim());
                    return [4 /*yield*/, prisma_1.prisma.pWResetToken.findUnique({
                            where: {
                                tokenHash: tokenHash
                            }
                        })];
                case 1:
                    reset = _b.sent();
                    if (!reset) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Invalid password reset request."
                            })];
                    }
                    if (reset.usedAt) {
                        return [2 /*return*/, res.status(400).json({
                                error: "This password reset token has already been used."
                            })];
                    }
                    now = new Date();
                    if (reset.expiresAt <=
                        now) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Password reset request has expired."
                            })];
                    }
                    return [4 /*yield*/, (0, password_1.hashPassword)(password)];
                case 2:
                    passwordHash = _b.sent();
                    /*
                     * Password update and token invalidation
                     * happen atomically.
                     */
                    return [4 /*yield*/, prisma_1.prisma.$transaction([
                            prisma_1.prisma.user.update({
                                where: {
                                    id: reset.userId
                                },
                                data: {
                                    passwordHash: passwordHash,
                                    passwordUpdatedAt: now
                                }
                            }),
                            prisma_1.prisma.pWResetToken.update({
                                where: {
                                    id: reset.id
                                },
                                data: {
                                    usedAt: now
                                }
                            })
                        ])];
                case 3:
                    /*
                     * Password update and token invalidation
                     * happen atomically.
                     */
                    _b.sent();
                    return [2 /*return*/, res.status(200).json({
                            ok: true,
                            message: "Password successfully updated. Please log in."
                        })];
                case 4:
                    err_8 = _b.sent();
                    console.error(err_8);
                    return [2 /*return*/, res.status(500).json({
                            error: "Unable to reset password."
                        })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
