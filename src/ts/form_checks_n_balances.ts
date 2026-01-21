/* =========================
   Helpers (TS-safe DOM)
========================= */

// need to import functions to the main.ts file
// add module type to html file as well

/*==========================
*         IMPORTS
* =========================*/

import {
  feedback_su,
  feedback_su2,
  feedback_su3,
  feedback_su6,
  feedback_su7,
  feedback_su8,
  feedback_su9,
  feedback_login,
  feedback_li2} from "./main.js";
import {hashPassword} from "../../backend/lib/password";

/*++++++++++++++++++++++++++++++++++++*/
/*++++++++++++++++++++++++++++++++++++*/

type newUserSignedUp = {
  firstName: string,
  lastName: string,
  userName: string,
  email: string,
  thePath: string
};

export function signUpForm_verified(
    fName: HTMLInputElement,
    lName: HTMLInputElement,
    uName: HTMLInputElement,
    userEmail: HTMLInputElement,
    confirmEmail: HTMLInputElement,
    pathway: HTMLInputElement,
    confirmPath: HTMLInputElement
): {ok: true; data: newUserSignedUp} | {ok: false} {

  // Helper function to update class based on condition
  function updateClass(
    element: HTMLElement,
    isValid: boolean,
    feedbackEl: HTMLElement,
    validComment: string,
    invalidComment: string
  ): void {
    if (isValid) {
      element.classList.add("is-valid");
      element.classList.remove("is-invalid");
      feedbackEl.classList.add("valid-feedback");
      feedbackEl.classList.remove("invalid-feedback");
      feedbackEl.innerHTML = validComment;
    } else {
      element.classList.add("is-invalid");
      element.classList.remove("is-valid");
      feedbackEl.classList.add("invalid-feedback");
      feedbackEl.classList.remove("valid-feedback");
      feedbackEl.innerHTML = invalidComment;
    }
  }

  function isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate fName: 3–25 characters
  const fNameVal = fName.value.trim();
  const validFName = fNameVal.length >= 3 && fNameVal.length <= 25;
  updateClass(
    fName,
    validFName,
    feedback_su,
    "Looks good",
    "3 to 20 characters are required!"
  );

  // Validate lName: 3–25 characters
  const lNameVal = lName.value.trim();
  const validLName = lNameVal.length >= 3 && lNameVal.length <= 25;
  updateClass(
    lName,
    validLName,
    feedback_su2,
    "Looks good",
    "3 to 20 characters are required!"
  );

  // Validate uName: 3–16 characters
  const uNameVal = uName.value.trim();
  const validUName = uNameVal.length >= 5 && uNameVal.length <= 16;
  updateClass(
    uName,
    validUName,
    feedback_su3,
    "Looks good",
    "5 to 16 characters are required!"
  );

  // Validate eMail: non-empty and valid format
  const eMailVal = userEmail.value.trim();
  const validEMail = eMailVal !== "" && isValidEmailFormat(eMailVal);
  updateClass(userEmail, validEMail, feedback_su6, "Email is good", "Email is not valid");

  // Validate confirmMail: matches eMail and valid format
  const confirmedEMailVal = confirmEmail.value.trim();
  const validConfirmedEMail = confirmedEMailVal !== "" && confirmedEMailVal === eMailVal;
  updateClass(confirmEmail, validConfirmedEMail, feedback_su7, "Email is confirmed", "Email does not match");

  // Validate password: 8–20 characters
  const passwordVal = pathway.value.trim();
  const validPassword = passwordVal.length >= 8 && passwordVal.length <= 20;
  updateClass(pathway, validPassword, feedback_su8, "Password is good", "8 to 20 characters are required");

  // Validate confirmPass: matches password and 8–20 characters
  const confirmedPassVal = confirmPath.value.trim();
  const validConfirmedPass = confirmedPassVal === passwordVal;

  updateClass(confirmPath, validConfirmedPass, feedback_su9, "Password is confirmed", "Password does not match!");

  const legit =
      validFName && validLName &&
      validUName && validEMail &&
      validConfirmedEMail && validPassword &&
      validConfirmedPass;

  if (!legit) return {ok: false};

  return {ok: true,
    data: {
      firstName: fNameVal,
      lastName: lNameVal,
      userName: uNameVal,
      email: confirmedEMailVal,
      thePath: confirmedPassVal,
    },
  };
}



/*=======================
   Login validation
=========================*/

export function loginForm_verified(uName: HTMLInputElement, pWord: HTMLInputElement): void {
  const uNameVal = uName.value.trim();
  const passwordVal = pWord.value.trim();

  // Regex to detect email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function uFeedback(reason: string, input: HTMLInputElement, feedbackEl: HTMLElement): void {
    if (reason) {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
      feedbackEl.classList.add("invalid-feedback");
      feedbackEl.classList.remove("valid-feedback");
    } else {
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

  function pFeedback(reason: string, input: HTMLInputElement, feedbackEl: HTMLElement): void {
    if (reason) {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
      feedbackEl.classList.add("invalid-feedback");
      feedbackEl.classList.remove("valid-feedback");
    } else {
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

  function notValidUsername(): string {
    if (uNameVal.length === 0) return "empty";
    if (uNameVal.length < 3) return "tooShort";
    if (uNameVal.length > 16) return "tooLong";
    if (emailPattern.test(uNameVal)) return "isEmail";
    return "";
  }

  function notValidPassword(): string {
    const securePass = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,20}$/;

    if (passwordVal.length === 0) return "empty";
    if (passwordVal.length < 8) return "tooShort";
    if (passwordVal.length > 20) return "tooLong";
    if (emailPattern.test(passwordVal)) return "isEmail";
    if (!securePass.test(passwordVal)) return "weak";
    return "";
  }

  const uNameError = notValidUsername();
  const pWordError = notValidPassword();

  uFeedback(uNameError, uName, feedback_login);
  pFeedback(pWordError, pWord, feedback_li2);
}

/*=======================
    checksNBalances
=========================*/
/* function is made to check users' input for valid entry before garbo goes to check users'
    email for either the email address or the keyword up for deletion
 */

// this will inform of which input field has an error and return an error message with it
type garboInputError = {
  input: "email" | "keyword";
  message: string;
}

// the user has the option to fill in the email input or the keyword input with this function
function checksNBalances(theEmail: string, theKey: string): garboInputError[] {
  // an empty array to catch all the errors
  const errors: garboInputError[] = [];

  const email = theEmail.trim();
  const keyword = theKey.trim();

  //don't leave both input fields blank Garbo needs something to search by
  if (email === "" && keyword === ""){
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
  if (email !== ""){
    if (!isValidEmail(email)) {
      errors.push({
        input: "email",
        message: "Please enter a valid email address"
      });
    }
  }

  if (keyword !== ""){
    if (keyword.length > 25) {
      errors.push({
        input: "keyword",
        message: "The input cannot have this many characters"
      });
    }
    if ( keyword.length < 3) {
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
function showGarboErrors(errors: garboInputError[]): void {
  //grabbing the HTML element by its className
  const emailErrorBox = document.querySelector(".errorMadeAtEmail") as HTMLElement | null;
  const keywordErrorBox = document.querySelector(".errorMadeAtKeyword") as HTMLElement | null;
  //grabbing the p tag within the previous classNames
  const emailErrorMsg = emailErrorBox?.querySelector("p") as HTMLParagraphElement | null;
  const keywordErrorMsg = keywordErrorBox?.querySelector("p") as HTMLParagraphElement | null;

  //default to CSS display setting
  emailErrorBox?.style.setProperty("display", "none");
  keywordErrorBox?.style.setProperty("display", "none");

  // clears old error messages
  if (emailErrorMsg) emailErrorMsg.textContent = "";
  if (keywordErrorMsg) keywordErrorMsg.textContent = "";

  // Find the first email-related error (if any)
  const emailErr = errors.find((e) => e.input === "email");

  // Find the first keyword-related error (if any)
  const keywordErr = errors.find((e) => e.input === "keyword");

  // If we found an email error, show it
  if (emailErr) {

    if (emailErrorMsg) emailErrorMsg.textContent = emailErr.message;

    emailErrorBox?.style.setProperty("display", "block");
  }

  // If we found a keyword error, show it
  if (keywordErr) {

    if (keywordErrorMsg) keywordErrorMsg.textContent = keywordErr.message;

    keywordErrorBox?.style.setProperty("display", "block");
  }

}

// this function ensures an email is in the correct format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // returns true or false
  return emailRegex.test(email);
}


// function isValidKeyword(): string {
//   return keyword_valid.value;
// }