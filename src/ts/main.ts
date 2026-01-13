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

