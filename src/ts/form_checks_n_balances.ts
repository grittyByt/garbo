/* =========================
   Helpers (TS-safe DOM)
========================= */

function qs<T extends Element>(selector: string, parent: ParentNode = document): T {
  const el = parent.querySelector(selector);
  if (!el) throw new Error(`Missing element for selector: ${selector}`);
  return el as T;
}

function qsa<T extends Element>(selector: string, parent: ParentNode = document): NodeListOf<T> {
  return parent.querySelectorAll(selector) as NodeListOf<T>;
}

/* =========================
   Existing DOM references
========================= */

const garbosForm = qs<HTMLFormElement>(".garbos-form");
const email_valid = qs<HTMLInputElement>("#email");
const keyword_valid = qs<HTMLInputElement>("#keyword");
const fDate = qs<HTMLInputElement>("#fdate");
const tDate = qs<HTMLInputElement>("#tdate");

const burger_menu = qs<HTMLButtonElement>(".navbar-toggler");
const intro = qs<HTMLElement>(".intro");
const welcomeBlock = qs<HTMLElement>(".welcome-user");

const login_button = qs<HTMLButtonElement>(".login-button");
const new_user_button = qs<HTMLButtonElement>(".new-user-button");
const theFoot = qs<HTMLElement>("footer");

/* =========================
   Elements we create
========================= */

// login side
const loginBlock = document.createElement("div");
const login_sheet = document.createElement("form");
const login_form_section = document.createElement("div");
const userName_input = document.createElement("input");
const password_input = document.createElement("input");
const loginForm_button = document.createElement("button");

// sign-up side
const newUserBlock = document.createElement("div");
const signUp_sheet = document.createElement("form");
const form_section = document.createElement("div");
const form_section6 = document.createElement("div");
const form_label = document.createElement("label");

const fName = document.createElement("input");
const lName = document.createElement("input");
const userEmail = document.createElement("input");
const uName = document.createElement("input");
const pathway = document.createElement("input");
const confirmEmail = document.createElement("input");
const confirmUser = document.createElement("input"); // currently unused
const confirmPath = document.createElement("input");

const signUp_btn = document.createElement("button");
const feedback_su = document.createElement("div");
const feedback_login = document.createElement("div");

const feedback = document.createElement("p"); // currently unused
const back_btn = document.createElement("button"); // currently unused

/* =========================
   Class names assignment
========================= */

loginBlock.classList.add("g-col-12", "login-user");
login_sheet.classList.add("row", "g-3", "needs-validation", "login-form");
login_form_section.classList.add("col-12");
loginForm_button.classList.add("form-btn");
userName_input.classList.add("form-control", "login-user-input");
password_input.classList.add("form-control", "login-pass-input");

newUserBlock.classList.add("g-col-12", "new-user");
signUp_sheet.classList.add("row", "g-3", "needs-validation", "signUp-form");
form_section.classList.add("col-md-4");
form_section6.classList.add("col-md-6");
form_label.classList.add("form-label");
fName.classList.add("form-control", "firsName");
lName.classList.add("form-control", "lastName");
userEmail.classList.add("form-control", "eMail");
confirmEmail.classList.add("form-control", "confirm-eMail");
uName.classList.add("form-control", "new-userName");
confirmUser.classList.add("form-control", "confirm-userName");
pathway.classList.add("new-password", "form-control");
confirmPath.classList.add("confirm-password", "form-control");
signUp_btn.classList.add("form-btn");

/* =========================
   Append blocks to page
========================= */

intro.appendChild(loginBlock);
intro.appendChild(newUserBlock);

/* =========================
   Clones (typed)
========================= */

const feedback_su2 = feedback_su.cloneNode(true) as HTMLDivElement;
const feedback_su3 = feedback_su.cloneNode(true) as HTMLDivElement;
const feedback_su6 = feedback_su.cloneNode(true) as HTMLDivElement;
const feedback_su7 = feedback_su.cloneNode(true) as HTMLDivElement;
const feedback_su8 = feedback_su.cloneNode(true) as HTMLDivElement;
const feedback_su9 = feedback_su.cloneNode(true) as HTMLDivElement;

const feedback_li2 = feedback_login.cloneNode(true) as HTMLDivElement;

/* =========================
   Event listeners
========================= */

login_button.addEventListener("click", () => {
  display_login();
});

new_user_button.addEventListener("click", () => {
  display_signUp();
});

signUp_btn.addEventListener("click", async (e: MouseEvent) => {
  e.preventDefault();

  signUp_verified(fName, lName, uName, userEmail, confirmEmail, pathway, confirmPath);

  const user: {
    fName: string;
    lName: string;
    uName: string;
    eMail: string;
    password: string;
  } = {
    fName: fName.value.trim(),
    lName: lName.value.trim(),
    uName: uName.value.trim(),
    eMail: userEmail.value.trim(),
    password: pathway.value.trim(),
  };

  const response = await fetch("http://localhost:3000/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  // Avoid "any": type the response shape you expect
  const data: { message?: string } = await response.json();

  if (response.ok) {
    alert("Signup successful!");
  } else {
    alert("Error: " + (data.message ?? "Unknown error"));
  }
});

loginForm_button.addEventListener("click", async (e: MouseEvent) => {
  e.preventDefault();
  login_verified(userName_input, password_input);
  console.log("login button pressed");
});

/* =========================
   UI builders
========================= */

function signIn(): void {
  // when the login button is pressed buttons disappear and a new form appears
}

function display_signUp(): void {
  // clones
  const form_section2 = form_section.cloneNode(true) as HTMLDivElement;
  const form_section3 = form_section.cloneNode(true) as HTMLDivElement;
  const form_section7 = form_section6.cloneNode(true) as HTMLDivElement;
  const form_section8 = form_section6.cloneNode(true) as HTMLDivElement;
  const form_section9 = form_section6.cloneNode(true) as HTMLDivElement;

  const form_label2 = form_label.cloneNode(true) as HTMLLabelElement;
  const form_label3 = form_label.cloneNode(true) as HTMLLabelElement;
  const form_label6 = form_label.cloneNode(true) as HTMLLabelElement;
  const form_label7 = form_label.cloneNode(true) as HTMLLabelElement;
  const form_label8 = form_label.cloneNode(true) as HTMLLabelElement;
  const form_label9 = form_label.cloneNode(true) as HTMLLabelElement;

  // append everything to their respective blocks
  newUserBlock.appendChild(signUp_sheet);
  signUp_sheet.appendChild(form_section);
  signUp_sheet.appendChild(form_section2);
  signUp_sheet.appendChild(form_section3);
  signUp_sheet.appendChild(form_section6);
  signUp_sheet.appendChild(form_section7);
  signUp_sheet.appendChild(form_section8);
  signUp_sheet.appendChild(form_section9);

  form_section.appendChild(form_label);
  form_section.appendChild(fName);
  form_section.appendChild(feedback_su);

  form_section2.appendChild(form_label2);
  form_section2.appendChild(lName);
  form_section2.appendChild(feedback_su2);

  form_section3.appendChild(form_label3);
  form_section3.appendChild(uName);
  form_section3.appendChild(feedback_su3);

  form_section6.appendChild(form_label6);
  form_section6.appendChild(userEmail);
  form_section6.appendChild(feedback_su6);

  form_section7.appendChild(form_label7);
  form_section7.appendChild(confirmEmail);
  form_section7.appendChild(feedback_su7);

  form_section8.appendChild(form_label8);
  form_section8.appendChild(pathway);
  form_section8.appendChild(feedback_su8);

  form_section9.appendChild(form_label9);
  form_section9.appendChild(confirmPath);
  form_section9.appendChild(feedback_su9);

  signUp_sheet.appendChild(signUp_btn);

  // homepage buttons disappear & a new div block appears while the original disappears
  welcomeBlock.style.display = "none";
  newUserBlock.style.display = "flex";

  signUp_sheet.style.display = "flex";
  signUp_sheet.action = "submit";
  signUp_sheet.noValidate = true;

  // Attributes for labels
  form_label.htmlFor = "validationCustom01";
  form_label.textContent = "First Name";

  form_label2.htmlFor = "validationCustom02";
  form_label2.textContent = "Last Name";

  form_label3.htmlFor = "validationCustom03";
  form_label3.textContent = "Create a Username";

  form_label6.htmlFor = "validationCustom04";
  form_label6.textContent = "Email";

  form_label7.htmlFor = "validationCustom05";
  form_label7.textContent = "Confirm Email";

  form_label8.htmlFor = "validationCustom06";
  form_label8.textContent = "Password";

  form_label9.htmlFor = "validationCustom07";
  form_label9.textContent = "Confirm Password";

  // Attributes for inputs on form
  fName.id = "validationCustom01";
  fName.required = true;

  lName.id = "validationCustom02";
  lName.required = true;

  uName.id = "validationCustom03";
  uName.required = true;

  userEmail.id = "validationCustom04";
  userEmail.required = true;

  confirmEmail.id = "validationCustom05";
  confirmEmail.required = true;

  pathway.id = "validationCustom06";
  pathway.required = true;

  confirmPath.id = "validationCustom07";
  confirmPath.required = true;

  // User's first name
  fName.type = "text";
  fName.name = "firstName";
  fName.placeholder = "Enter your first name";

  // User's last name
  lName.type = "text";
  lName.name = "lastName";
  lName.placeholder = "Enter your last name";

  // Username
  uName.type = "text";
  uName.name = "userName";
  uName.placeholder = "Enter you new username";

  // User's email
  userEmail.type = "email";
  userEmail.name = "email";
  userEmail.placeholder = "Enter your email";

  // Confirm email
  confirmEmail.type = "email";
  confirmEmail.name = "confirmEmail";
  confirmEmail.placeholder = "Confirm your email";

  // User's password
  pathway.type = "password";
  pathway.name = "password";
  pathway.placeholder = "Enter a password";

  // Confirm password
  confirmPath.type = "password";
  confirmPath.name = "confirmPassword";
  confirmPath.placeholder = "Confirm the password";

  // sign up button
  signUp_btn.type = "button";
  signUp_btn.textContent = "Sign Up";
}

/* =========================
   Validators (typed + fixed)
========================= */

function signUp_verified(
  fName: HTMLInputElement,
  lName: HTMLInputElement,
  uName: HTMLInputElement,
  userEmail: HTMLInputElement,
  confirmEmail: HTMLInputElement,
  pathway: HTMLInputElement,
  confirmPath: HTMLInputElement
): void {
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

  // Validate fName: 3–20 characters
  const fNameVal = fName.value.trim();
  updateClass(
    fName,
    fNameVal.length >= 3 && fNameVal.length <= 20,
    feedback_su,
    "Looks good",
    "First Name: 3 to 20 characters are required!"
  );

  // Validate lName: 3–20 characters
  const lNameVal = lName.value.trim();
  updateClass(
    lName,
    lNameVal.length >= 3 && lNameVal.length <= 20,
    feedback_su2,
    "Looks good",
    "Last Name: 3 to 20 characters are required!"
  );

  // Validate uName: 3–16 characters
  const uNameVal = uName.value.trim();
  updateClass(
    uName,
    uNameVal.length >= 3 && uNameVal.length <= 16,
    feedback_su3,
    "Looks good",
    "Username: 3 to 16 characters are required!"
  );

  // Validate eMail: non-empty and valid format
  const eMailVal = userEmail.value.trim();
  const eMailValid = eMailVal !== "" && isValidEmailFormat(eMailVal);
  updateClass(userEmail, eMailValid, feedback_su6, "Email is good", "Email: Not valid!");

  // Validate confirmMail: matches eMail and valid format
  const confirmMailVal = confirmEmail.value.trim();
  const confirmMailValid = confirmMailVal !== "" && confirmMailVal === eMailVal && isValidEmailFormat(confirmMailVal);
  updateClass(confirmEmail, confirmMailValid, feedback_su7, "Email is confirmed", "Email: Not a match!");

  // Validate password: 8–20 characters
  const passwordVal = pathway.value.trim();
  const passwordValid = passwordVal.length >= 8 && passwordVal.length <= 20;
  updateClass(pathway, passwordValid, feedback_su8, "Password is good", "Password: 8 to 20 characters are required!");

  // Validate confirmPass: matches password and 8–20 characters
  const confirmPassVal = confirmPath.value.trim();
  const confirmPassValid = confirmPassVal === passwordVal && confirmPassVal.length >= 8 && confirmPassVal.length <= 20;
  updateClass(confirmPath, confirmPassValid, feedback_su9, "Password is confirmed", "Password: Not a match!");
}

/* =========================
   Bootstrap validation hook (FIXED)
========================= */

// Your JS tried: Array.from(forms).forEach(...)
// But forms is a single HTMLFormElement, not iterable.
// Fix: wrap it in an array.

((): void => {
  "use strict";

  const form = signUp_sheet;
  [form].forEach((f) => {
    f.addEventListener(
      "submit",
      (event) => {
        if (!f.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        f.classList.add("was-validated");
      },
      false
    );
  });
})();

/* =========================
   Login validation (typed + fixed comparisons)
========================= */

function login_verified(uName: HTMLInputElement, pWord: HTMLInputElement): void {
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

/* =========================
   Login display
========================= */

function display_login(): void {
  welcomeBlock.style.display = "none";
  loginBlock.style.display = "flex";

  // clones
  const login_form_section2 = login_form_section.cloneNode(true) as HTMLDivElement;
  const form_label4 = form_label.cloneNode(true) as HTMLLabelElement;
  const form_label5 = form_label.cloneNode(true) as HTMLLabelElement;

  // add everything to the block
  loginBlock.appendChild(login_sheet);
  login_sheet.appendChild(login_form_section);
  login_sheet.appendChild(login_form_section2);

  login_form_section.appendChild(form_label4);
  login_form_section.appendChild(userName_input);
  login_form_section.appendChild(feedback_login);

  login_form_section2.appendChild(form_label5);
  login_form_section2.appendChild(password_input);
  login_form_section2.appendChild(feedback_li2);

  login_sheet.appendChild(loginForm_button);

  form_label4.htmlFor = "login-user-input";
  form_label4.textContent = "Username:";
  form_label5.htmlFor = "login-pass-input";
  form_label5.textContent = "Password:";

  login_sheet.style.display = "flex";
  login_sheet.action = "submit";
  login_sheet.noValidate = true;

  // username input
  userName_input.type = "text";
  userName_input.name = "username";
  userName_input.placeholder = "Enter username";

  // password input
  password_input.type = "password";
  password_input.name = "password";
  password_input.placeholder = "Enter password";

  // login button
  loginForm_button.type = "button";
  loginForm_button.textContent = "Submit";
}

/* =========================
   checksNBalances + keyword/email (fixed)
========================= */
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
  // the function returns all the errors (if any) found.  Fills up garborInputError array
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


function isValidKeyword(): string {
  return keyword_valid.value;
}