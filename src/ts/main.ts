/*==========================
 *         IMPORTS
 * =========================*/
import { signUpForm_verified, loginForm_verified } from "./form_checks_n_balances.js";
import { emailVerifyDisplay } from "./emailVerify.js";
import { API_BASE_URL } from "./api-config.js";
import {process} from "std-env";

function qs<T extends Element>(selector: string, parent: ParentNode = document): T {
  const element = parent.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Missing element for selector: ${selector}`);
  }
  return element;
}

/* =========================
   Existing DOM references
========================= */
const intro = qs<HTMLElement>(".greetings");
const welcomeBlock = qs<HTMLElement>(".welcome-section");
const login_button = qs<HTMLButtonElement>(".login-button");
const new_user_button = qs<HTMLButtonElement>(".new-user-button");
const garboIntro = qs<HTMLElement>(".whoIsGarbo");
const PORT = process.env.PORT

/* =========================
   Shared authentication card
========================= */
const authCard = document.createElement("section");
const authPanel = document.createElement("div");
const authTabs = document.createElement("div");
const authForms = document.createElement("div");

const loginTab = document.createElement("button");
const signUpTab = document.createElement("button");

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
const loginBlock = document.createElement("div");
const login_sheet = document.createElement("form");
const login_form_section = document.createElement("div");
const login_form_section2 = document.createElement("div");
const loginUserLabel = document.createElement("label");
const loginPasswordLabel = document.createElement("label");
const userName_input = document.createElement("input");
const password_input = document.createElement("input");
const loginForm_button = document.createElement("button");
const keepSignedInGroup = document.createElement("div");
const keepSignedIn = document.createElement("input");
const keepSignedInLabel = document.createElement("label");
const keepSignedInIcon = document.createElement("span");
const forgotPassword = document.createElement("a");
const loginDivider = document.createElement("div");

export const feedback_login = document.createElement("div");
export const feedback_li2 = feedback_login.cloneNode(true) as HTMLDivElement;

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
forgotPassword.href = "#forgot";
forgotPassword.textContent = "Forgot Password?";

login_form_section.append(loginUserLabel, userName_input, feedback_login);
login_form_section2.append(loginPasswordLabel, password_input, feedback_li2);
keepSignedInGroup.append(keepSignedIn, keepSignedInLabel);
login_sheet.append(
  login_form_section,
  login_form_section2,
  keepSignedInGroup,
  loginForm_button,
  loginDivider,
  forgotPassword,
);
loginBlock.appendChild(login_sheet);

/* =========================
   Sign-up elements
========================= */
const newUserBlock = document.createElement("div");
const signUp_sheet = document.createElement("form");
const fName = document.createElement("input");
const lName = document.createElement("input");
const userEmail = document.createElement("input");
const confirmEmail = document.createElement("input");
const uName = document.createElement("input");
const password = document.createElement("input");
const confirmPassword = document.createElement("input");
const signUp_btn = document.createElement("button");
const signUpDivider = document.createElement("div");
const alreadyMember = document.createElement("button");

export const feedback_su = document.createElement("div");
export const feedback_su2 = feedback_su.cloneNode(true) as HTMLDivElement;
export const feedback_su3 = feedback_su.cloneNode(true) as HTMLDivElement;
export const feedback_su6 = feedback_su.cloneNode(true) as HTMLDivElement;
export const feedback_su7 = feedback_su.cloneNode(true) as HTMLDivElement;
export const feedback_su8 = feedback_su.cloneNode(true) as HTMLDivElement;
export const feedback_su9 = feedback_su.cloneNode(true) as HTMLDivElement;

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

function createSignUpGroup(
  labelText: string,
  input: HTMLInputElement,
  feedback: HTMLDivElement,
): HTMLDivElement {
  const group = document.createElement("div");
  const label = document.createElement("label");

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

signUp_sheet.append(
  createSignUpGroup("First Name", fName, feedback_su),
  createSignUpGroup("Last Name", lName, feedback_su2),
  createSignUpGroup("Create a Username", uName, feedback_su3),
  createSignUpGroup("Email", userEmail, feedback_su6),
  createSignUpGroup("Confirm Email", confirmEmail, feedback_su7),
  createSignUpGroup("Password", password, feedback_su8),
  createSignUpGroup("Confirm Password", confirmPassword, feedback_su9),
  signUp_btn,
  signUpDivider,
  alreadyMember,
);
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
function openAuthCard(mode: "login" | "signup"): void {
  welcomeBlock.style.display = "none";
  garboIntro.style.display = "none";
  authCard.classList.add("visible");

  const showLogin = mode === "login";

  loginBlock.classList.toggle("active", showLogin);
  newUserBlock.classList.toggle("active", !showLogin);
  loginTab.classList.toggle("active", showLogin);
  signUpTab.classList.toggle("active", !showLogin);
  loginTab.setAttribute("aria-selected", String(showLogin));
  signUpTab.setAttribute("aria-selected", String(!showLogin));

  if (showLogin) {
    userName_input.focus();
  } else {
    fName.focus();
  }
}

function display_login(): void {
  openAuthCard("login");
}

function display_signUp(): void {
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
signUp_sheet.addEventListener("submit", async (event) => {
  event.preventDefault();

  const result = signUpForm_verified(
    fName,
    lName,
    uName,
    userEmail,
    confirmEmail,
    password,
    confirmPassword,
  );

  if (!result.ok) {
    signUp_sheet.classList.add("was-validated");
    return;
  }

  const user = {
    firstName: fName.value.trim(),
    lastName: lName.value.trim(),
    userName: uName.value.trim(),
    eMail: confirmEmail.value.trim(),
    password: confirmPassword.value,
  };

  try {
    signUp_btn.disabled = true;

    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    const data: { error?: string } = await response.json();

    if (!response.ok) {
      alert(data.error ?? "Signup failed.");
      return;
    }

    await emailVerifyDisplay();
    // alert("Signup successful!");
    // signUp_sheet.reset();
    // display_login();
  } catch (error: unknown) {
    console.error("Signup request failed:", error);
    alert("Unable to connect to the server. Please try again.");
  } finally {
    signUp_btn.disabled = false;
  }
});

login_sheet.addEventListener("submit", (event) => {
  event.preventDefault();
  loginForm_verified(userName_input, password_input);
});
