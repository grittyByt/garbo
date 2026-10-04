"use strict";
/* =========================
   Helpers (TS-safe DOM)
========================= */
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUpForm_verified = signUpForm_verified;
exports.loginForm_verified = loginForm_verified;
// need to import functions to the main.ts file
// add module type to html file as well
/*==========================
*         IMPORTS
* =========================*/
var main_js_1 = require("./main.js");
function signUpForm_verified(fName, lName, uName, 
// age: HTMLInputElement,
userEmail, confirmEmail, pathway, confirmPath) {
    // Helper function to update class based on condition
    function updateClass(element, isValid, feedbackEl, validComment, invalidComment) {
        if (isValid) {
            element.classList.add("is-valid");
            element.classList.remove("is-invalid");
            feedbackEl.classList.add("valid-feedback");
            feedbackEl.classList.remove("invalid-feedback");
            feedbackEl.innerHTML = validComment;
        }
        else {
            element.classList.add("is-invalid");
            element.classList.remove("is-valid");
            feedbackEl.classList.add("invalid-feedback");
            feedbackEl.classList.remove("valid-feedback");
            feedbackEl.innerHTML = invalidComment;
        }
    }
    function isValidEmailFormat(email) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    // Validate fName: 3–25 characters
    var fNameVal = fName.value.trim();
    var validFName = fNameVal.length >= 2 && fNameVal.length <= 25;
    updateClass(fName, validFName, main_js_1.feedback_su, "Looks good", "3 to 20 characters are required!");
    // Validate lName: 3–25 characters
    var lNameVal = lName.value.trim();
    var validLName = lNameVal.length >= 3 && lNameVal.length <= 25;
    updateClass(lName, validLName, main_js_1.feedback_su2, "Looks good", "3 to 20 characters are required!");
    // Validate uName: 5–16 characters
    var uNameVal = uName.value.trim();
    var validUName = uNameVal.length >= 5 && uNameVal.length <= 16;
    updateClass(uName, validUName, main_js_1.feedback_su3, "Looks good", "5 to 16 characters are required!");
    // Validate eMail: non-empty and valid format
    var eMailVal = userEmail.value.trim();
    var validEMail = eMailVal !== "" && isValidEmailFormat(eMailVal);
    updateClass(userEmail, validEMail, main_js_1.feedback_su6, "Email is good", "Email is not valid");
    // Validate confirmMail: matches eMail and valid format
    var confirmedEMailVal = confirmEmail.value.trim();
    var validConfirmedEMail = confirmedEMailVal !== "" && confirmedEMailVal === eMailVal;
    updateClass(confirmEmail, validConfirmedEMail, main_js_1.feedback_su7, "Email is confirmed", "Email does not match");
    // Validate password: 8–20 characters
    var passwordVal = pathway.value.trim();
    var validPassword = passwordVal.length >= 8 && passwordVal.length <= 20;
    updateClass(pathway, validPassword, main_js_1.feedback_su8, "Password is good", "8 to 20 characters are required");
    // Validate confirmPass: matches password and 8–20 characters
    var confirmedPassVal = confirmPath.value.trim();
    var validConfirmedPass = confirmedPassVal === passwordVal;
    updateClass(confirmPath, validConfirmedPass, main_js_1.feedback_su9, "Password is confirmed", "Password does not match!");
    var legit = validFName && validLName &&
        validUName && validEMail &&
        validConfirmedEMail && validPassword &&
        validConfirmedPass;
    if (!legit)
        return { ok: false };
    return { ok: true,
        data: {
            firstName: fNameVal,
            lastName: lNameVal,
            userName: uNameVal,
            eMail: confirmedEMailVal,
            password: confirmedPassVal,
        },
    };
}
/*=======================
   Login validation
=========================*/
function loginForm_verified(uName, pWord) {
    var uNameVal = uName.value.trim();
    var passwordVal = pWord.value.trim();
    // Regex to detect email
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    function uFeedback(reason, input, feedbackEl) {
        if (reason) {
            input.classList.add("is-invalid");
            input.classList.remove("is-valid");
            feedbackEl.classList.add("invalid-feedback");
            feedbackEl.classList.remove("valid-feedback");
        }
        else {
            input.classList.add("is-valid");
            input.classList.remove("is-invalid");
            feedbackEl.classList.add("valid-feedback");
            feedbackEl.classList.remove("invalid-feedback");
        }
        switch (reason) {
            case "tooShort":
                feedbackEl.innerHTML = "Username is too short";
                break;
            case "tooLong":
                feedbackEl.innerHTML = "Username is too long";
                break;
            case "isEmail":
                feedbackEl.innerHTML = "Username cannot be an email address";
                break;
            case "empty":
                feedbackEl.innerHTML = "Username cannot be empty";
                break;
            default:
                feedbackEl.classList.remove("invalid-feedback");
                feedbackEl.classList.add("valid-feedback");
                feedbackEl.innerHTML = "Looks good";
        }
    }
    function pFeedback(reason, input, feedbackEl) {
        if (reason) {
            input.classList.add("is-invalid");
            input.classList.remove("is-valid");
            feedbackEl.classList.add("invalid-feedback");
            feedbackEl.classList.remove("valid-feedback");
        }
        else {
            input.classList.add("is-valid");
            input.classList.remove("is-invalid");
            feedbackEl.classList.add("valid-feedback");
            feedbackEl.classList.remove("invalid-feedback");
        }
        switch (reason) {
            case "tooShort":
                feedbackEl.innerHTML = "Password is too short";
                break;
            case "tooLong":
                feedbackEl.innerHTML = "Password is too long";
                break;
            case "isEmail":
                feedbackEl.innerHTML = "Password cannot be an email address";
                break;
            case "weak":
                feedbackEl.innerHTML = "Password must contain at least one special character and one number";
                break;
            case "empty":
                feedbackEl.innerHTML = "Password cannot be empty";
                break;
            default:
                feedbackEl.classList.remove("invalid-feedback");
                feedbackEl.classList.add("valid-feedback");
                feedbackEl.innerHTML = "Looks good";
        }
    }
    function notValidUsername() {
        if (uNameVal.length === 0)
            return "empty";
        if (uNameVal.length < 3)
            return "tooShort";
        if (uNameVal.length > 16)
            return "tooLong";
        if (emailPattern.test(uNameVal))
            return "isEmail";
        return "";
    }
    function notValidPassword() {
        var securePass = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,20}$/;
        if (passwordVal.length === 0)
            return "empty";
        if (passwordVal.length < 8)
            return "tooShort";
        if (passwordVal.length > 20)
            return "tooLong";
        if (emailPattern.test(passwordVal))
            return "isEmail";
        if (!securePass.test(passwordVal))
            return "weak";
        return "";
    }
    var uNameError = notValidUsername();
    var pWordError = notValidPassword();
    uFeedback(uNameError, uName, main_js_1.feedback_login);
    pFeedback(pWordError, pWord, main_js_1.feedback_li2);
}
// the user has the option to fill in the email input or the keyword input with this function
function checksNBalances(theEmail, theKey) {
    // an empty array to catch all the errors
    var errors = [];
    var email = theEmail.trim();
    var keyword = theKey.trim();
    //don't leave both input fields blank Garbo needs something to search by
    if (email === "" && keyword === "") {
        //email error
        errors.push({
            input: "email",
            message: "Enter an email address or a keyword to be searched (at least one is required)"
        });
        //keyword error
        errors.push({
            input: "keyword",
            message: "Enter a keyword or an email address to be searched (at least one is required)"
        });
        // no form submission if there is an error
        return errors;
    }
    /* Email rules are set so if the user wants to not enter a valid email in the input
    * then an error will show*/
    if (email !== "") {
        if (!isValidEmail(email)) {
            errors.push({
                input: "email",
                message: "Please enter a valid email address"
            });
        }
    }
    if (keyword !== "") {
        if (keyword.length > 25) {
            errors.push({
                input: "keyword",
                message: "The input cannot have this many characters"
            });
        }
        if (keyword.length < 3) {
            errors.push({
                input: "keyword",
                message: "The input cannot be this short"
            });
        }
    }
    // the function returns all the errors (if any) found.  Fills up garboInputError array
    return errors;
}
// this function will affect the DOM by displaying the error messages to the user
function showGarboErrors(errors) {
    //grabbing the HTML element by its className
    var emailErrorBox = document.querySelector(".errorMadeAtEmail");
    var keywordErrorBox = document.querySelector(".errorMadeAtKeyword");
    //grabbing the p tag within the previous classNames
    var emailErrorMsg = emailErrorBox === null || emailErrorBox === void 0 ? void 0 : emailErrorBox.querySelector("p");
    var keywordErrorMsg = keywordErrorBox === null || keywordErrorBox === void 0 ? void 0 : keywordErrorBox.querySelector("p");
    //default to CSS display setting
    emailErrorBox === null || emailErrorBox === void 0 ? void 0 : emailErrorBox.style.setProperty("display", "none");
    keywordErrorBox === null || keywordErrorBox === void 0 ? void 0 : keywordErrorBox.style.setProperty("display", "none");
    // clears old error messages
    if (emailErrorMsg)
        emailErrorMsg.textContent = "";
    if (keywordErrorMsg)
        keywordErrorMsg.textContent = "";
    // Find the first email-related error (if any)
    var emailErr = errors.find(function (e) { return e.input === "email"; });
    // Find the first keyword-related error (if any)
    var keywordErr = errors.find(function (e) { return e.input === "keyword"; });
    // If we found an email error, show it
    if (emailErr) {
        if (emailErrorMsg)
            emailErrorMsg.textContent = emailErr.message;
        emailErrorBox === null || emailErrorBox === void 0 ? void 0 : emailErrorBox.style.setProperty("display", "block");
    }
    // If we found a keyword error, show it
    if (keywordErr) {
        if (keywordErrorMsg)
            keywordErrorMsg.textContent = keywordErr.message;
        keywordErrorBox === null || keywordErrorBox === void 0 ? void 0 : keywordErrorBox.style.setProperty("display", "block");
    }
}
// this function ensures an email is in the correct format
function isValidEmail(email) {
    var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // returns true or false
    return emailRegex.test(email);
}
// function isValidKeyword(): string {
//   return keyword_valid.value;
// }
