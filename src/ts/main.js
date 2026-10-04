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
exports.feedback_su9 = exports.feedback_su8 = exports.feedback_su7 = exports.feedback_su6 = exports.feedback_su3 = exports.feedback_su2 = exports.feedback_su = exports.feedback_li2 = exports.feedback_login = void 0;
/*==========================
 *         IMPORTS
 * =========================*/
var form_checks_n_balances_js_1 = require("./form_checks_n_balances.js");
var emailVerify_js_1 = require("./emailVerify.js");
var api_config_js_1 = require("./api-config.js");
function qs(selector, parent) {
    if (parent === void 0) { parent = document; }
    var element = parent.querySelector(selector);
    if (!element) {
        throw new Error("Missing element for selector: ".concat(selector));
    }
    return element;
}
/* =========================
   Existing DOM references
========================= */
var intro = qs(".greetings");
var welcomeBlock = qs(".welcome-section");
var login_button = qs(".login-button");
var new_user_button = qs(".new-user-button");
var garboIntro = qs(".whoIsGarbo");
/* =========================
   Shared authentication card
========================= */
var authCard = document.createElement("section");
var authPanel = document.createElement("div");
var authTabs = document.createElement("div");
var authForms = document.createElement("div");
var loginTab = document.createElement("button");
var signUpTab = document.createElement("button");
authCard.classList.add("auth-card");
authPanel.classList.add("auth-panel");
authTabs.classList.add("auth-tabs");
authForms.classList.add("auth-forms");
loginTab.classList.add("auth-tab", "active");
signUpTab.classList.add("auth-tab");
loginTab.type = "button";
signUpTab.type = "button";
loginTab.textContent = "Sign In";
signUpTab.textContent = "Sign Up";
loginTab.setAttribute("aria-controls", "login-form-panel");
signUpTab.setAttribute("aria-controls", "signup-form-panel");
loginTab.setAttribute("aria-selected", "true");
signUpTab.setAttribute("aria-selected", "false");
/* =========================
   Login elements
========================= */
var loginBlock = document.createElement("div");
var login_sheet = document.createElement("form");
var login_form_section = document.createElement("div");
var login_form_section2 = document.createElement("div");
var loginUserLabel = document.createElement("label");
var loginPasswordLabel = document.createElement("label");
var userName_input = document.createElement("input");
var password_input = document.createElement("input");
var loginForm_button = document.createElement("button");
var keepSignedInGroup = document.createElement("div");
var keepSignedIn = document.createElement("input");
var keepSignedInLabel = document.createElement("label");
var keepSignedInIcon = document.createElement("span");
var forgotUsername = document.createElement("a");
var forgotPassword = document.createElement("a");
var loginDivider = document.createElement("div");
exports.feedback_login = document.createElement("div");
exports.feedback_li2 = exports.feedback_login.cloneNode(true);
loginBlock.classList.add("col-12", "login-user");
login_sheet.classList.add("row", "g-3", "needs-validation", "login-form");
login_form_section.classList.add("col-12", "form-group");
login_form_section2.classList.add("col-12", "form-group");
loginUserLabel.classList.add("form-label");
loginPasswordLabel.classList.add("form-label");
userName_input.classList.add("form-control", "login-user-input");
password_input.classList.add("form-control", "login-pass-input");
loginForm_button.classList.add("form-btn");
keepSignedInGroup.classList.add("col-12", "keep-signed-in");
keepSignedIn.classList.add("check");
keepSignedInIcon.classList.add("icon");
forgotUsername.classList.add("forgot-username");
forgotPassword.classList.add("forgot-password");
loginDivider.classList.add("form-divider");
login_sheet.id = "login-form-panel";
login_sheet.noValidate = true;
loginUserLabel.htmlFor = "login-user-input";
loginUserLabel.textContent = "Username";
loginPasswordLabel.htmlFor = "login-pass-input";
loginPasswordLabel.textContent = "Password";
userName_input.id = "login-user-input";
userName_input.type = "text";
userName_input.name = "username";
userName_input.placeholder = "Enter username";
userName_input.autocomplete = "username";
userName_input.required = true;
password_input.id = "login-pass-input";
password_input.type = "password";
password_input.name = "password";
password_input.placeholder = "Enter password";
password_input.autocomplete = "current-password";
password_input.required = true;
keepSignedIn.id = "keep-signed-in";
keepSignedIn.type = "checkbox";
keepSignedIn.checked = true;
keepSignedInLabel.htmlFor = "keep-signed-in";
keepSignedInLabel.append(keepSignedInIcon, " Keep me signed in");
loginForm_button.type = "submit";
loginForm_button.textContent = "Sign In";
forgotUsername.href = "#forgot";
forgotUsername.textContent = "Forgot Username";
forgotPassword.href = "#forgot";
forgotPassword.textContent = "Forgot Password?";
login_form_section.append(loginUserLabel, userName_input, exports.feedback_login);
login_form_section2.append(loginPasswordLabel, password_input, exports.feedback_li2);
keepSignedInGroup.append(keepSignedIn, keepSignedInLabel);
login_sheet.append(login_form_section, login_form_section2, keepSignedInGroup, loginForm_button, loginDivider, forgotUsername, forgotPassword);
loginBlock.appendChild(login_sheet);
/* =========================
   Sign-up elements
========================= */
var newUserBlock = document.createElement("div");
var signUp_sheet = document.createElement("form");
var fName = document.createElement("input");
var lName = document.createElement("input");
var userEmail = document.createElement("input");
var confirmEmail = document.createElement("input");
var uName = document.createElement("input");
var password = document.createElement("input");
var confirmPassword = document.createElement("input");
var signUp_btn = document.createElement("button");
var signUpDivider = document.createElement("div");
var alreadyMember = document.createElement("button");
exports.feedback_su = document.createElement("div");
exports.feedback_su2 = exports.feedback_su.cloneNode(true);
exports.feedback_su3 = exports.feedback_su.cloneNode(true);
exports.feedback_su6 = exports.feedback_su.cloneNode(true);
exports.feedback_su7 = exports.feedback_su.cloneNode(true);
exports.feedback_su8 = exports.feedback_su.cloneNode(true);
exports.feedback_su9 = exports.feedback_su.cloneNode(true);
newUserBlock.classList.add("col-12", "new-user");
signUp_sheet.classList.add("row", "g-3", "needs-validation", "signUp-form");
fName.classList.add("form-control", "firsName");
lName.classList.add("form-control", "lastName");
userEmail.classList.add("form-control", "eMail");
confirmEmail.classList.add("form-control", "confirm-eMail");
uName.classList.add("form-control", "new-userName");
password.classList.add("new-password", "form-control");
confirmPassword.classList.add("confirm-password", "form-control");
signUp_btn.classList.add("form-btn");
signUpDivider.classList.add("form-divider");
alreadyMember.classList.add("already-member");
signUp_sheet.id = "signup-form-panel";
signUp_sheet.noValidate = true;
signUp_sheet.method = "POST";
function createSignUpGroup(labelText, input, feedback) {
    var group = document.createElement("div");
    var label = document.createElement("label");
    group.classList.add("col-12", "form-group");
    label.classList.add("form-label");
    label.htmlFor = input.id;
    label.textContent = labelText;
    group.append(label, input, feedback);
    return group;
}
fName.id = "validationCustom01";
fName.type = "text";
fName.name = "firstName";
fName.placeholder = "Enter your first name";
fName.autocomplete = "given-name";
fName.required = true;
lName.id = "validationCustom02";
lName.type = "text";
lName.name = "lastName";
lName.placeholder = "Enter your last name";
lName.autocomplete = "family-name";
lName.required = true;
uName.id = "validationCustom03";
uName.type = "text";
uName.name = "userName";
uName.placeholder = "Create a username";
uName.autocomplete = "username";
uName.required = true;
userEmail.id = "validationCustom04";
userEmail.type = "email";
userEmail.name = "email";
userEmail.placeholder = "Enter your email";
userEmail.autocomplete = "email";
userEmail.required = true;
confirmEmail.id = "validationCustom05";
confirmEmail.type = "email";
confirmEmail.name = "eMail";
confirmEmail.placeholder = "Confirm your email";
confirmEmail.autocomplete = "email";
confirmEmail.required = true;
password.id = "validationCustom06";
password.type = "password";
password.name = "password";
password.placeholder = "Create a password";
password.autocomplete = "new-password";
password.required = true;
confirmPassword.id = "validationCustom07";
confirmPassword.type = "password";
confirmPassword.name = "passwordHash";
confirmPassword.placeholder = "Confirm your password";
confirmPassword.autocomplete = "new-password";
confirmPassword.required = true;
signUp_btn.type = "submit";
signUp_btn.textContent = "Sign Up";
alreadyMember.type = "button";
alreadyMember.textContent = "Already a member? Sign in";
signUp_sheet.append(createSignUpGroup("First Name", fName, exports.feedback_su), createSignUpGroup("Last Name", lName, exports.feedback_su2), createSignUpGroup("Create a Username", uName, exports.feedback_su3), createSignUpGroup("Email", userEmail, exports.feedback_su6), createSignUpGroup("Confirm Email", confirmEmail, exports.feedback_su7), createSignUpGroup("Password", password, exports.feedback_su8), createSignUpGroup("Confirm Password", confirmPassword, exports.feedback_su9), signUp_btn, signUpDivider, alreadyMember);
newUserBlock.appendChild(signUp_sheet);
/* =========================
   Build card once
========================= */
authTabs.append(loginTab, signUpTab);
authForms.append(loginBlock, newUserBlock);
authPanel.append(authTabs, authForms);
authCard.appendChild(authPanel);
intro.appendChild(authCard);
/* =========================
   UI behavior
========================= */
function openAuthCard(mode) {
    welcomeBlock.style.display = "none";
    garboIntro.style.display = "none";
    authCard.classList.add("visible");
    var showLogin = mode === "login";
    loginBlock.classList.toggle("active", showLogin);
    newUserBlock.classList.toggle("active", !showLogin);
    loginTab.classList.toggle("active", showLogin);
    signUpTab.classList.toggle("active", !showLogin);
    loginTab.setAttribute("aria-selected", String(showLogin));
    signUpTab.setAttribute("aria-selected", String(!showLogin));
    if (showLogin) {
        userName_input.focus();
    }
    else {
        fName.focus();
    }
}
function display_login() {
    openAuthCard("login");
}
function display_signUp() {
    openAuthCard("signup");
}
login_button.addEventListener("click", display_login);
new_user_button.addEventListener("click", display_signUp);
loginTab.addEventListener("click", display_login);
signUpTab.addEventListener("click", display_signUp);
alreadyMember.addEventListener("click", display_login);
/* =========================
   Form submission
========================= */
signUp_sheet.addEventListener("submit", function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var result, user, response, data, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                event.preventDefault();
                result = (0, form_checks_n_balances_js_1.signUpForm_verified)(fName, lName, uName, userEmail, confirmEmail, password, confirmPassword);
                if (!result.ok) {
                    signUp_sheet.classList.add("was-validated");
                    return [2 /*return*/];
                }
                user = {
                    firstName: fName.value.trim(),
                    lastName: lName.value.trim(),
                    userName: uName.value.trim(),
                    eMail: confirmEmail.value.trim(),
                    password: confirmPassword.value,
                };
                _b.label = 1;
            case 1:
                _b.trys.push([1, 5, 6, 7]);
                signUp_btn.disabled = true;
                return [4 /*yield*/, fetch("".concat(api_config_js_1.API_BASE_URL, "/api/auth/signup"), {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(user),
                    })];
            case 2:
                response = _b.sent();
                return [4 /*yield*/, response.json()];
            case 3:
                data = _b.sent();
                if (!response.ok) {
                    alert((_a = data.error) !== null && _a !== void 0 ? _a : "Signup failed.");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, emailVerify_js_1.emailVerifyDisplay)()];
            case 4:
                _b.sent();
                return [3 /*break*/, 7];
            case 5:
                error_1 = _b.sent();
                console.error("Signup request failed:", error_1);
                alert("Unable to connect to the server. Please try again.");
                return [3 /*break*/, 7];
            case 6:
                signUp_btn.disabled = false;
                return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); });
login_sheet.addEventListener("submit", function (event) {
    event.preventDefault();
    (0, form_checks_n_balances_js_1.loginForm_verified)(userName_input, password_input);
});
