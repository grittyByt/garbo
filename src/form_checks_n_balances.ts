const email_valid = document.querySelector('.email');
const keyword_valid = document.querySelector('.keyword');
const fDate = document.querySelector('#fdate');
const tDate = document.querySelector('#tdate');
const burger_menu = document.querySelector('.navbar-toggler');
const intro = document.querySelector('.intro');
const welcomeBlock = document.querySelector('.welcome-user');
const login_button = document.querySelector('.login-button');
const new_user_button = document.querySelector('.new-user-button');
const theFoot   = document.querySelector('footer');
// login side
const loginBlock = document.createElement('div');
const login_sheet = document.createElement('form');
const login_form_section = document.createElement('div');
const userName_input = document.createElement('input');
const password_input = document.createElement('input');
const loginForm_button = document.createElement('button');
// sign-up side
const newUserBlock = document.createElement('div');
const signUp_sheet = document.createElement('form');
const form_section = document.createElement('div');
const form_section6 = document.createElement('div');
const form_label = document.createElement('label');
const fName = document.createElement('input');
const lName = document.createElement('input');
const userEmail = document.createElement('input');
const uName = document.createElement('input');
const pathway = document.createElement('input');
const confirmEmail = document.createElement('input');
const confirmUser = document.createElement('input');
const confirmPath = document.createElement('input');
const signUp_btn = document.createElement('button');
const feedback_su = document.createElement('div');
const feedback_login = document.createElement('div');

const feedback = document.createElement('p');
// back to home button
const back_btn = document.createElement('button');




// Class names assignment
loginBlock.classList.add('g-col-12', 'login-user');
login_sheet.classList.add('row', 'g-3', 'needs-validation', 'login-form');
login_form_section.classList.add('col-12');
loginForm_button.classList.add('form-btn');
userName_input.classList.add('form-control', 'login-user-input');
password_input.classList.add('form-control', 'login-pass-input')

/////////////////////////////
newUserBlock.classList.add('g-col-12', 'new-user');
signUp_sheet.classList.add('row', 'g-3', 'needs-validation', 'signUp-form');
form_section.classList.add('col-md-4');
form_section6.classList.add('col-md-6');
form_label.classList.add('form-label');
fName.classList.add('form-control', 'firsName');
lName.classList.add('form-control', 'lastName');
userEmail.classList.add('form-control', 'eMail');
confirmEmail.classList.add('form-control', 'confirm-eMail');
uName.classList.add('form-control', 'new-userName');
confirmUser.classList.add('form-control', 'confirm-userName');
pathway.classList.add('new-password', 'form-control');
confirmPath.classList.add('confirm-password', 'form-control');
signUp_btn.classList.add('form-btn');




// Append children cells
intro.appendChild(loginBlock);
intro.appendChild(newUserBlock);
// back_btn.appendChild(loginBlock);
// back_btn.appendChild(newUserBlock);

// clones
const feedback_su2  = feedback_su.cloneNode(true);
const feedback_su3  = feedback_su.cloneNode(true);
const feedback_su6  = feedback_su.cloneNode(true);
const feedback_su7  = feedback_su.cloneNode(true);
const feedback_su8  = feedback_su.cloneNode(true);
const feedback_su9  = feedback_su.cloneNode(true);

const feedback_li2 = feedback_login.cloneNode(true);


// burger_menu.addEventListener('click', ()=>{
//     // const mobile_navbar_open = document.getElementById('.show')
//     // mobile_navbar_open.setAttribute('style', 'background-color: #e52666');
//     // mobile_navbar_open.style.backgroundColor = '#e52666';
//     menuTextOpacity();
//
// });
// function menuTextOpacity() {
//   const mobile_navbar_open = document.querySelector(".nav-link");
//   mobile_navbar_open.classList.add("opacityFunc");
//   console.log('fading in and fading out');
// }

login_button.addEventListener('click', () => {
        display_login();
        // theFoot.setAttribute('style', 'border: none');



})

new_user_button.addEventListener('click', () => {
    display_signUp();
    // theFoot.setAttribute('style', 'border: none');
})

signUp_btn.addEventListener('click', async function (e) {
    e.preventDefault();
    signUp_verified(fName, lName, uName, userEmail, confirmEmail, pathway, confirmPath);

    const user = {
    fName: fName.value.trim(),
    lName: lName.value.trim(),
    uName: uName.value.trim(),
    eMail: userEmail.value.trim(),
    password: pathway.value.trim()  ,
    };

    const response = await fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });

    const data = await response.json();

    if (response.ok) {
        alert('Signup successful!');
    } else {
        alert('Error: ' + data.message);
    }
})

loginForm_button.addEventListener('click', async function (e) {
    e.preventDefault();
    login_verified(userName_input, password_input);
    return console.log('login button pressed');
})



function signIn(){
    // when the login button is pressed buttons disappear and a new form appears

}

function display_signUp() {



    // clones
    const form_section2 = form_section.cloneNode(true);
    const form_section3 = form_section.cloneNode(true);
    const form_section7 = form_section6.cloneNode(true);
    const form_section8 = form_section6.cloneNode(true);
    const form_section9 = form_section6.cloneNode(true);

    const form_label2 = form_label.cloneNode(true);
    const form_label3 = form_label.cloneNode(true);
    const form_label6 = form_label.cloneNode(true);
    const form_label7 = form_label.cloneNode(true);
    const form_label8 = form_label.cloneNode(true);
    const form_label9 = form_label.cloneNode(true);

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
    // signUp_sheet.appendChild(userEmail);
    // signUp_sheet.appendChild(confirmEmail);
    // signUp_sheet.appendChild(uName);
    // signUp_sheet.appendChild(pathway);
    // signUp_sheet.appendChild(confirmPath);
    signUp_sheet.appendChild(signUp_btn);


    // homepage buttons disappear & a new div block appears while the original disappears
    welcomeBlock.setAttribute('style', 'display: none');
    // theFoot.setAttribute('style', 'display: none');
    newUserBlock.setAttribute('style', 'display: flex');

    signUp_sheet.setAttribute('style', 'display: flex');
    signUp_sheet.setAttribute('action', 'submit');
    signUp_sheet.setAttribute('novalidate','');

    // Attributes for labels
    form_label.setAttribute('for', 'validationCustom01');
    form_label.textContent = 'First Name';
    form_label2.setAttribute('for', 'validationCustom02');
    form_label2.textContent = 'Last Name';
    form_label3.setAttribute('for', 'validationCustom03');
    form_label3.textContent = 'Create a Username';
    form_label6.setAttribute('for', 'validationCustom04');
    form_label6.textContent = 'Email';
    form_label7.setAttribute('for', 'validationCustom05');
    form_label7.textContent = 'Confirm Email';
    form_label8.setAttribute('for', 'validationCustom06');
    form_label8.textContent = 'Password';
    form_label9.setAttribute('for', 'validationCustom07');
    form_label9.textContent = 'Confirm Password';



    // Attributes for inputs on form
    fName.setAttribute('id', 'validationCustom01');
    fName.setAttribute('required', '');
    lName.setAttribute('id', 'validationCustom02');
    lName.setAttribute('required', '');
    uName.setAttribute('id', 'validationCustom03');
    uName.setAttribute('required', '');
    userEmail.setAttribute('id', 'validationCustom04');
    userEmail.setAttribute('required', '');
    confirmEmail.setAttribute('id', 'validationCustom05');
    confirmEmail.setAttribute('required', '');
    pathway.setAttribute('id', 'validationCustom06');
    pathway.setAttribute('required', '');
    confirmPath.setAttribute('id', 'validationCustom07');
    confirmPath.setAttribute('required', '');

    // User's first name
    fName.type = 'text';
    fName.name =  'firstName';
    fName.placeholder = 'Enter your first name';

    // User's last name
    lName.type = 'text';
    lName.name =  'lastName';
    lName.placeholder = 'Enter your last name';

    // Username
    uName.type = 'text';
    uName.name = 'userName';
    uName.placeholder = 'Enter you new username';

    // User's email
    userEmail.type = 'email';
    userEmail.name =  'email';
    userEmail.placeholder = 'Enter your email';

    // Confirm email
    confirmEmail.type = 'email';
    confirmEmail.name =  'confirmEmail';
    confirmEmail.placeholder = 'Confirm your email';

    // User's password
    pathway.type = 'password';
    pathway.name = 'password';
    pathway.placeholder = 'Enter a password';

    // Confirm password
    confirmPath.type = 'password';
    confirmPath.name = 'confirmPassword';
    confirmPath.placeholder = 'Confirm the password';

    //sign up button
    signUp_btn.type = 'button';
    signUp_btn.textContent = 'Sign Up';


}

function signUp_verified(fName, lName, uName, userEmail, confirmEmail, pathway, confirmPath) {

    // Helper function to update class based on condition
    function updateClass(element, esValid, feedback, validComment, inValidComment) {
        if (esValid) {
            element.classList.add('is-valid');
            element.classList.remove('is-invalid');
            feedback.classList.add('valid-feedback');
            feedback.classList.remove('invalid-feedback');
            feedback.innerHTML = validComment;
        } else {
            element.classList.add('is-invalid');
            element.classList.remove('is-valid');
            feedback.classList.add('invalid-feedback');
            feedback.classList.remove('valid-feedback');
            feedback.innerHTML = inValidComment;
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate fName: 3–20 characters
    const fNameVal = fName.value.trim();
    updateClass(fName,
        fNameVal.length >= 3 && fNameVal.length <= 20,
        feedback_su,
        'Looks good',
        'First Name: 3 to 20 characters are required!');

    // Validate lName: 3–20 characters
    const lNameVal = lName.value.trim();
    updateClass(lName,
        lNameVal.length >= 3 && lNameVal.length <= 20,
        feedback_su2,
        'Looks good',
        'Last Name: 3 to 20 characters are required!');

    // Validate uName: 3–16 characters
    const uNameVal = uName.value.trim();
    updateClass(uName,
        uNameVal.length >= 3 && uNameVal.length <= 16,
        feedback_su3,
        'Looks good',
        'Username: 3 to 16 characters are required!');

    // Validate eMail: non-empty and valid format
    const eMailVal = userEmail.value.trim();
    const eMailValid = eMailVal !== '' && isValidEmail(eMailVal);
    updateClass(userEmail,
        eMailValid,
        feedback_su6,
        'Email is good',
        'Email: Not valid!');

    // Validate confirmMail: matches eMail and valid format
    const confirmMailVal = confirmEmail.value.trim();
    const confirmMailValid =
        confirmMailVal !== '' &&
        confirmMailVal === eMailVal &&
        isValidEmail(confirmMailVal);
    updateClass(confirmEmail,
        confirmMailValid,
        feedback_su7,
        'Email is confirmed',
        'Email: Not a match!');

    // Validate password: 8–20 characters
    const passwordVal = pathway.value.trim();
    const passwordValid = passwordVal.length >= 8 && passwordVal.length <= 20;
    updateClass(pathway,
        passwordValid,
        feedback_su8,
        'Password is good',
        'Password: 3 to 20 characters are required!');

    // Validate confirmPass: matches password and 8–20 characters
    const confirmPassVal = confirmPath.value.trim();
    const confirmPassValid =
        confirmPassVal === passwordVal &&
        confirmPassVal.length >= 8 &&
        confirmPassVal.length <= 20;
    updateClass(confirmPath,
        confirmPassValid,
        feedback_su9,
        'Password is confirmed',
        'Password: Not a match!');
}
// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = signUp_sheet;

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

function login_verified(uName,pWord) {

    // username input value
    const uNameVal = uName.value.trim();

    // password input value
    const passwordVal = pWord.value.trim();

    // Regex to detect email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function uFeedback(reason, input, feedback){

        if (reason) {
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
            feedback.classList.add('invalid-feedback');
            feedback.classList.remove('valid-feedback');
        } else {
            input.classList.add('is-valid');
            input.classList.remove('is-invalid');
            feedback.classList.add('valid-feedback');
            feedback.classList.remove('invalid-feedback');
        }

        switch (reason) {
            case "tooShort":
                feedback.innerHTML = "Username is too short";
                break;
            case "tooLong":
                feedback.innerHTML = "Username is too long";
                break;
            case "isEmail":
                feedback.innerHTML = "Username cannot be an email address";
                break;
            case "empty":
                feedback.innerHTML = "Username cannot be empty";
                break;
            default:
                feedback.classList.remove('invalid-feedback');
                feedback.classList.add('valid-feedback');
                feedback.innerHTML = "Looks good";
        }
    }

    function pFeedback(reason, input, feedback){

        if (reason) {
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
            feedback.classList.add('invalid-feedback');
            feedback.classList.remove('valid-feedback');
        } else {
            input.classList.add('is-valid');
            input.classList.remove('is-invalid');
            feedback.classList.add('valid-feedback');
            feedback.classList.remove('invalid-feedback');
        }

        switch (reason) {
            case "tooShort":
                feedback.innerHTML = "Password is too short";
                break;
            case "tooLong":
                feedback.innerHTML = "Password is too long";
                break;
            case "isEmail":
                feedback.innerHTML = "Password cannot be an email address";
                break;
            case "weak":
                feedback.innerHTML = "Password must contain at least contain one special character and one number";
                break;
            case "empty":
                feedback.innerHTML = "Password cannot be empty";
                break;
            default:
                feedback.classList.remove('invalid-feedback');
                feedback.classList.add('valid-feedback');
                feedback.innerHTML = "Looks good";
        }
    }

    // function to check for errors as it pertains to the input field (username) for the login form
    function notValidUsername (){
        if (uNameVal.length < 3 || uNameVal === 1) {
            console.log(uNameVal.length);
            return "tooShort";
        } else if (uNameVal.length > 16) {
            console.log(uNameVal.length);
            return "tooLong";
        } else if (emailPattern.test(uNameVal)) {
            console.log(uNameVal.length);
            return "isEmail";
        } else if (uNameVal.length === 0) {
            return "empty";
        } else {
            return ""; // no errors
        }
    }

    function notValidPassword () {
        const securePass = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,20}$/;

        if (passwordVal.length < 3 || passwordVal === 1) {
            console.log(passwordVal.length);
            return "tooShort";
        } else if (passwordVal.length > 20) {
            console.log(passwordVal.length);
            return "tooLong";
        } else if (emailPattern.test(passwordVal)) {
            console.log(passwordVal.length);
            return "isEmail";
        } else if (!securePass.test(passwordVal)) {
            console.log(passwordVal.length);
            return "weak";
        } else if (passwordVal.length === 0) {
            return "empty";
        } else {
            return ""; // no errors
        }

    }

    //  will return one of the error messages within these function
    const uNameError = notValidUsername();
    const pWordError = notValidPassword();
    uFeedback(uNameError, uName, feedback_login);
    pFeedback(pWordError, pWord, feedback_li2);
}

function display_login() {


    // buttons disappear & a new div block appears
    welcomeBlock.setAttribute('style', 'display: none');
    // theFoot.setAttribute('style', 'display: none');
    loginBlock.setAttribute('style', 'display: flex');

     // clones
    const login_form_section2 = login_form_section.cloneNode(true);
    const form_label4 = form_label.cloneNode(true);
    const form_label5 = form_label.cloneNode(true);


     // add everything to the block
    loginBlock.appendChild(login_sheet);
    login_sheet.appendChild(login_form_section);
    login_sheet.appendChild(login_form_section2);
    login_form_section.appendChild(form_label4)
    login_form_section.appendChild(userName_input);
    login_form_section.appendChild(feedback_login)
    login_form_section2.appendChild(form_label5);
    login_form_section2.appendChild(password_input);
    login_form_section2.appendChild(feedback_li2);
    login_sheet.appendChild(loginForm_button);

    form_label4.setAttribute('for', 'login-user-input');
    form_label4.textContent = 'Username:';
    form_label5.setAttribute('for', 'login-pass-input');
    form_label5.textContent = 'Password:';
    // new_user_button.setAttribute('style', 'display: none');

    // login form appears
    login_sheet.setAttribute('style', 'display: flex')
    login_sheet.setAttribute('action', 'submit');
    login_sheet.setAttribute('novalidate','');


    // add classList for inputs to get over the issue of not being able to manipulate in CSS
    userName_input.classList.add('login-user-input');
    password_input.classList.add('login-pass-input');

    // username input
    userName_input.type = 'text';
    userName_input.name = 'username';
    userName_input.placeholder = 'Enter username';

    // password input
    password_input.type = 'password';
    password_input.name = 'password';
    password_input.placeholder = 'Enter password';

    //login button
    loginForm_button.type = 'button';
    loginForm_button.textContent = 'Submit';

}

// signIn();

async function checksNBalances(validEmail, validKeyword){
    try {
        // const theEmail = await isValidEmail();

        if(!isValidEmail(validEmail)){
            const email_invalid = document.querySelector('.errorMade');
            email_invalid.setAttribute('style', 'display: block');
            return false;
        }

        validKeyword = isValidKeyword;

        if(validKeyword === ""){
            const keyword_invalid = document.querySelector('.errorMadeAgain');
            let keyword_message = document.querySelector('.errorMadeAgain p');
            keyword_message.textContent = 'Keyword cannot be left blank';
            keyword_invalid.setAttribute('style', 'display: block');
            return;

        }

        if(validKeyword > 16){
            const keyword_invalid = document.querySelector('.errorMadeAgain');
            let keyword_message = document.querySelector('.errorMadeAgain p');
            keyword_message.textContent = 'Keyword has too many letters';
            keyword_invalid.setAttribute('style', 'display: block');
            return;
        }

        if(validKeyword < 3){
            const keyword_invalid = document.querySelector('.errorMadeAgain');
            let keyword_message = document.querySelector('.errorMadeAgain p');
            keyword_message.textContent = 'Keyword does not have enough letters';
            keyword_invalid.setAttribute('style', 'display: block');
            return;
        }

        // if(validKeyword > 16 || validKeyword < 3){
        // const keyword_invalid = document.querySelector('.errorMadeAgain');
        // keyword_invalid.setAttribute('style', 'display: block');
        // return;
        // }
        console.log('Validation was successful');
        return true;
    }catch (error){
        console.error("An error occurred:", error);
        return false;
    }
}


function isValidEmail(email){
    // checks to see if email format is used and if so then it is True
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

isValidEmail();

function isValidKeyword(keyword){
    keyword = keyword_valid.value;
    return keyword;
}


//need to check if email entered is valid
//if it is not valid then return an error message
//if it is valid then store data and wait for next inputs
//the same will be done for the keyword input
//throw an error if both are blank
//date selected can not exceed further than the current day and can go back as far as the year 2000
