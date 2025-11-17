// Base de datos simulada (almacenamiento en memoria)
let users = {
    'admin': {
        password: '1234',
        securityQuestion: '¿Cuál es tu color favorito?',
        securityAnswer: 'rojo'
    }
};

// Elementos del DOM
const loginPage = document.getElementById('login-page');
const dashboardPage = document.getElementById('dashboard-page');
const navItems = document.querySelectorAll('.nav-item');
const forms = document.querySelectorAll('.form');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const helpForm = document.getElementById('help-form');
const recoveryForm = document.getElementById('recovery-form');
const forgotPasswordLink = document.getElementById('forgot-password');
const backToLoginLink = document.getElementById('back-to-login');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const recoveryBtn = document.getElementById('recovery-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginMessage = document.getElementById('login-message');
const registerMessage = document.getElementById('register-message');
const recoveryMessage = document.getElementById('recovery-message');
const securityQuestionContainer = document.getElementById('security-question-container');
const securityAnswerContainer = document.getElementById('security-answer-container');
const newPasswordContainer = document.getElementById('new-password-container');
const displayedQuestion = document.getElementById('displayed-question');
const welcomeUser = document.getElementById('welcome-user');
const dashboardWelcome = document.getElementById('dashboard-welcome');

// Variable para almacenar el usuario actual
let currentUser = null;

// Navegación entre formularios
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        
        // Actualizar navegación activa
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Mostrar formulario correspondiente
        forms.forEach(form => {
            form.classList.remove('active');
            if (form.id === target) {
                form.classList.add('active');
            }
        });
    });
});

// Mostrar formulario de recuperación de contraseña
forgotPasswordLink.addEventListener('click', () => {
    forms.forEach(form => form.classList.remove('active'));
    recoveryForm.classList.add('active');
    navItems.forEach(nav => nav.classList.remove('active'));
    
    // Resetear formulario de recuperación
    document.getElementById('recovery-username').value = '';
    document.getElementById('recovery-answer').value = '';
    document.getElementById('recovery-new-password').value = '';
    securityAnswerContainer.classList.add('security-question');
    newPasswordContainer.classList.add('security-question');
    recoveryMessage.textContent = '';
    recoveryMessage.className = 'message';
    recoveryMessage.style.display = 'none';
});

// Volver al formulario de login
backToLoginLink.addEventListener('click', () => {
    forms.forEach(form => form.classList.remove('active'));
    loginForm.classList.add('active');
    navItems.forEach(nav => {
        if (nav.getAttribute('data-target') === 'login-form') {
            nav.classList.add('active');
        }
    });
});

// Función para mostrar mensajes
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
}

// Función para mostrar el dashboard
function showDashboard(username) {
    currentUser = username;
    
    // Actualizar mensajes de bienvenida
    welcomeUser.textContent = `Bienvenido, ${username}`;
    dashboardWelcome.textContent = `¡Bienvenido ${username} al Dashboard!`;
    
    // Mostrar dashboard y ocultar login
    loginPage.style.display = 'none';
    dashboardPage.style.display = 'block';
    
    // Limpiar formulario de login
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Función para volver al login
function showLogin() {
    currentUser = null;
    dashboardPage.style.display = 'none';
    loginPage.style.display = 'flex';
    
    // Resetear a formulario de login
    forms.forEach(form => form.classList.remove('active'));
    loginForm.classList.add('active');
    navItems.forEach(nav => {
        if (nav.getAttribute('data-target') === 'login-form') {
            nav.classList.add('active');
        }
    });
}

// Inicio de sesión
loginBtn.addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showMessage(loginMessage, 'Por favor, completa todos los campos', 'error');
        return;
    }
    
    if (users[username] && users[username].password === password) {
        showMessage(loginMessage, `¡Bienvenido, ${username}! Redirigiendo...`, 'success');
        
        // Redirigir al dashboard después de 1.5 segundos
        setTimeout(() => {
            showDashboard(username);
        }, 1500);
    } else {
        showMessage(loginMessage, 'Usuario o contraseña incorrectos', 'error');
    }
});

// Cerrar sesión
logoutBtn.addEventListener('click', () => {
    showLogin();
    showMessage(loginMessage, `¡Hasta pronto, Sesión cerrada correctamente.`, 'success');
});

// Registro de usuario
registerBtn.addEventListener('click', () => {
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const securityQuestion = document.getElementById('security-question').value;
    const securityAnswer = document.getElementById('security-answer').value;
    
    if (!username || !password || !securityQuestion || !securityAnswer) {
        showMessage(registerMessage, 'Por favor, completa todos los campos', 'error');
        return;
    }
    
    if (users[username]) {
        showMessage(registerMessage, 'Este nombre de usuario ya está en uso', 'error');
        return;
    }
    
    // Registrar nuevo usuario
    users[username] = {
        password: password,
        securityQuestion: securityQuestion,
        securityAnswer: securityAnswer.toLowerCase()
    };
    
    showMessage(registerMessage, '¡Usuario registrado exitosamente!', 'success');
    
    // Limpiar formulario
    document.getElementById('new-username').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('security-question').value = '';
    document.getElementById('security-answer').value = '';
    
    // Cambiar a formulario de login después de 2 segundos
    setTimeout(() => {
        forms.forEach(form => form.classList.remove('active'));
        loginForm.classList.add('active');
        navItems.forEach(nav => {
            if (nav.getAttribute('data-target') === 'login-form') {
                nav.classList.add('active');
            }
        });
    }, 2000);
});

// Recuperación de contraseña
recoveryBtn.addEventListener('click', () => {
    const username = document.getElementById('recovery-username').value;
    
    if (!username) {
        showMessage(recoveryMessage, 'Por favor, ingresa tu nombre de usuario', 'error');
        return;
    }
    
    // Si no hemos mostrado la pregunta de seguridad
    if (securityAnswerContainer.classList.contains('security-question')) {
        if (!users[username]) {
            showMessage(recoveryMessage, 'Usuario no encontrado', 'error');
            return;
        }
        
        // Mostrar pregunta de seguridad
        displayedQuestion.textContent = users[username].securityQuestion;
        securityAnswerContainer.classList.remove('security-question');
        showMessage(recoveryMessage, 'Por favor, responde tu pregunta de seguridad', 'success');
        return;
    }
    
    // Si estamos verificando la respuesta
    if (newPasswordContainer.classList.contains('security-question')) {
        const answer = document.getElementById('recovery-answer').value.toLowerCase();
        
        if (!answer) {
            showMessage(recoveryMessage, 'Por favor, ingresa tu respuesta', 'error');
            return;
        }
        
        if (answer !== users[username].securityAnswer) {
            showMessage(recoveryMessage, 'Respuesta incorrecta', 'error');
            return;
        }
        
        // Mostrar campo para nueva contraseña
        newPasswordContainer.classList.remove('security-question');
        showMessage(recoveryMessage, 'Ahora puedes establecer una nueva contraseña', 'success');
        return;
    }
    
    // Establecer nueva contraseña
    const newPassword = document.getElementById('recovery-new-password').value;
    
    if (!newPassword) {
        showMessage(recoveryMessage, 'Por favor, ingresa una nueva contraseña', 'error');
        return;
    }
    
    // Actualizar contraseña
    users[username].password = newPassword;
    showMessage(recoveryMessage, '¡Contraseña actualizada exitosamente!', 'success');
    
    // Volver al login después de 2 segundos
    setTimeout(() => {
        forms.forEach(form => form.classList.remove('active'));
        loginForm.classList.add('active');
        navItems.forEach(nav => {
            if (nav.getAttribute('data-target') === 'login-form') {
                nav.classList.add('active');
            }
        });
        
        // Resetear formulario de recuperación
        document.getElementById('recovery-username').value = '';
        document.getElementById('recovery-answer').value = '';
        document.getElementById('recovery-new-password').value = '';
        securityAnswerContainer.classList.add('security-question');
        newPasswordContainer.classList.add('security-question');
    }, 2000);
});