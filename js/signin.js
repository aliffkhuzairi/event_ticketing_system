document.addEventListener('DOMContentLoaded', () => {
    const signUpForm = document.getElementById('signupForm');
    const signInForm = document.getElementById('signinForm');
    const container = document.querySelector('.container');
    const showhidePw = document.querySelectorAll('.showhidePw');
    const pwFields = document.querySelectorAll('.password');
    const signup = document.querySelector('#signUp');
    const signin = document.querySelector('#signIn');

    showhidePw.forEach(eyeIcon =>{
        eyeIcon.addEventListener('click', () =>{
            pwFields.forEach(pwField =>{
                if(pwField.type == 'password'){
                    pwField.type = 'text';
                    showhidePw.forEach(icon =>{
                        icon.classList.replace('fa-eye-slash','fa-eye')
                    })
                }else{
                    pwField.type = "password";
                    showhidePw.forEach(icon =>{
                        icon.classList.replace('fa-eye','fa-eye-slash')
                    })       
                }
            })
        })
    })

    signup.addEventListener('click', () =>{
        container.classList.add('active');
    });

    signin.addEventListener('click', () =>{
        container.classList.remove('active');
    });

    // Helper Functions for User Data
    function getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }

    function saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Sign-Up Form Handler
    signUpForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value.trim();
        const passwordConfirm = document.getElementById('signupPasswordConfirm').value.trim();

        const users = getUsers();

        // Validation: Unique username and email
        if (users.some(user => user.username === username)) {
            alert('Username is already taken. Please choose a different one.');
            return;
        }
        if (users.some(user => user.email === email)) {
            alert('Email is already registered. Please use a different email.');
            return;
        }
        if (password !== passwordConfirm) {
            alert('Passwords do not match. Please confirm your password.');
            return;
        }

        // Save new user
        const newUser = { 
            username, 
            email, 
            password,
            firstName: '',
            lastName: '',
            cards:[], 
        };

        users.push(newUser);
        saveUsers(users);

        alert('Account created successfully! Please sign in.');

        signUpForm.reset();
        container.classList.remove("active"); // Switch to Sign-In panel
    });

    // Sign-In Form Handler
    signInForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const emailOrUsername = document.getElementById('emailInput').value.trim();
        const password = document.getElementById('passwordInput').value.trim();
        const users = getUsers();

        // Validate username/email and password
        const user = users.find(u =>
            (u.username === emailOrUsername || u.email === emailOrUsername) && u.password === password
        );

        if (!user) {
            alert('Invalid username/email or password. Please try again.');
        } else {

            // Ensure user structure includes the `card` property
            if (!user.cards) {
                user.cards = []; // Initialize cards if missing
                const userIndex = users.findIndex(u => u.username === user.username);
                if (userIndex !== -1) {
                    users[userIndex] = user;
                    saveUsers(users); // Save updated users back to localStorage
                }
            }

            // Save the logged-in user
            localStorage.setItem('currentUser', JSON.stringify(user));

            // Redirect to the last visited page or the default page
            const redirectURL = localStorage.getItem('redirectAfterLogin') || 'index.html';
            localStorage.removeItem('redirectAfterLogin');
            window.location.href = redirectURL;
        }

        signInForm.reset();
    });
});
