
const themeToggleBtn = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');

function updateIcons(isDark) {
    if (isDark) {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

const savedTheme = localStorage.getItem('typeMasterTheme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    updateIcons(true);
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('typeMasterTheme', isDark ? 'dark' : 'light');
        updateIcons(isDark);
    });
}


const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const authMsg = document.getElementById('auth-msg');


if(showRegisterBtn) {
    showRegisterBtn.addEventListener('click', () => {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        authMsg.classList.remove('feedback-visible');
    });
}

if(showLoginBtn) {
    showLoginBtn.addEventListener('click', () => {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        authMsg.classList.remove('feedback-visible');
    });
}


function showError(msg) {
    authMsg.innerText = msg;
    authMsg.classList.add('feedback-visible');
    setTimeout(() => authMsg.classList.remove('feedback-visible'), 3000);
}

if(registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value.trim();

        if(username.length < 3) { showError("Username too short!"); return; }
        if(password.length < 4) { showError("Password too short!"); return; }

        const users = JSON.parse(localStorage.getItem('typeMasterUsers')) || {};

        if (users[username]) {
            showError("User already exists!");
            return;
        }

        users[username] = { password: password, highScore: 0 };
        localStorage.setItem('typeMasterUsers', JSON.stringify(users));
        
        alert("Account created! Please log in.");
        location.reload();
    });
}


if(loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();

        const users = JSON.parse(localStorage.getItem('typeMasterUsers')) || {};

        if (users[username] && users[username].password === password) {
            localStorage.setItem('typeMasterCurrentUser', username);
            window.location.href = "index.html";
        } else {
            showError("Invalid Credentials");
        }
    });
}


window.togglePassword = function(inputId, iconSpan) {
    const input = document.getElementById(inputId);
    const isPassword = input.type === 'password';

    input.type = isPassword ? 'text' : 'password';

    
    if (isPassword) {
       
        iconSpan.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>`;
    } else {
        
        iconSpan.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>`;
    }

}
