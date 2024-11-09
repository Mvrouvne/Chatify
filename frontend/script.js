document.addEventListener('DOMContentLoaded', function() {
    // Signin Form Elements
    const loginForm = document.querySelector('.signin .form');
    const loginUsernameInput = loginForm.querySelector('#login-username');
    const loginPasswordInput = loginForm.querySelector('#login-password');
    const loginButton = loginForm.querySelector('#login-button');
    const loginMessageElement = document.querySelector('#login-message');
    
    // Signup Form Elements
    const signupForm = document.querySelector('.signup .form');
    const signupUsernameInput = signupForm.querySelector('#register-username');
    const signupFirstNameInput = signupForm.querySelector('#register-firstname'); // First Name field
    const signupLastNameInput = signupForm.querySelector('#register-lastname'); // Last Name field
    const signupEmailInput = signupForm.querySelector('#register-email');
    const signupPasswordInput = signupForm.querySelector('#register-password');
    const signupButton = signupForm.querySelector('#register-button');
    const signupMessageElement = document.querySelector('#register-message');
    
    // Show Signup Form
    const showSignupLink = document.getElementById('show-signup');
    const signinForm = document.querySelector('.signin');
    const signupContainer = document.querySelector('.signup');

    showSignupLink.addEventListener('click', function(event) {
        event.preventDefault();
        signinForm.style.display = 'none';
        signupContainer.style.display = 'block';
    });
    
    // Show Signin Form
    const showSigninLink = document.getElementById('show-signin');
    showSigninLink.addEventListener('click', function(event) {
        event.preventDefault();
        signupContainer.style.display = 'none';
        signinForm.style.display = 'block';
    });
    
    // Handle Login
    loginButton.addEventListener('click', function(event) {
        event.preventDefault();
        const username = loginUsernameInput.value;
        const password = loginPasswordInput.value;
    
        fetch('http://localhost:8000/api/auth/token/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.auth_token) {
                // Store the token in localStorage
                localStorage.setItem('authToken', data.auth_token);
                loginMessageElement.textContent = 'Login successful';
                loginMessageElement.style.color = 'green';
                window.location.href = 'http://localhost:8001/chat-dash.html';
            } else {
                loginMessageElement.textContent = 'Login failed: ' + JSON.stringify(data);
                loginMessageElement.style.color = 'red';
            }
        })
        .catch(error => {
            loginMessageElement.textContent = 'Error: ' + error;
            loginMessageElement.style.color = 'red';
        });
    });
    
    // Handle Signup
    signupButton.addEventListener('click', function(event) {
        event.preventDefault();
        const username = signupUsernameInput.value;
        const firstName = signupFirstNameInput.value; // Capture First Name
        const lastName = signupLastNameInput.value;   // Capture Last Name
        const email = signupEmailInput.value;
        const password = signupPasswordInput.value;
    
        fetch('http://localhost:8000/api/auth/users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                first_name: firstName, // Send First Name to the API
                last_name: lastName,   // Send Last Name to the API
                email: email,
                password: password,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                signupMessageElement.textContent = 'Signup successful';
                signupMessageElement.style.color = 'green';
                signinForm.style.display = 'block';
                signupContainer.style.display = 'none';
            } else {
                signupMessageElement.textContent = 'Signup failed: ' + JSON.stringify(data);
                signupMessageElement.style.color = 'red';
            }
        })
        .catch(error => {
            signupMessageElement.textContent = 'Error: ' + error;
            signupMessageElement.style.color = 'red';
        });
    });
});
