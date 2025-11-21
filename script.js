// Base de datos simulada (almacenamiento en memoria Y localStorage)
let users = {};

// Inicializar usuarios desde localStorage o con admin por defecto
function initializeUsers() {
    const storedUsers = JSON.parse(localStorage.getItem('users'));
    
    if (storedUsers) {
        users = storedUsers;
    }
    
    // SIEMPRE asegurar que el admin exista
    if (!users['admin']) {
        users['admin'] = {
            password: '1234',
            role: 'admin',
            saldo: 0,
            securityQuestion: '¿Cuál es tu color favorito?',
            securityAnswer: 'rojo'
        };
        saveUsersToStorage();
    }
}

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
const userRoleDisplay = document.getElementById('user-role-display');

// Dashboards por rol
const colaboradorDashboard = document.getElementById('colaborador-dashboard');
const empleadorDashboard = document.getElementById('empleador-dashboard');
const adminDashboard = document.getElementById('admin-dashboard');

// Variable para almacenar el usuario actual
let currentUser = null;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar usuarios (con admin por defecto)
    initializeUsers();
    
    // Verificar si hay una sesión activa
    checkActiveSession();
});

function saveUsersToStorage() {
    localStorage.setItem('users', JSON.stringify(users));
}

function checkActiveSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser && users[savedUser]) {
        // Si hay un usuario guardado y existe en la base de datos, iniciar sesión automáticamente
        currentUser = savedUser;
        showDashboard(currentUser);
    }
}

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
    
    // Ocultar mensaje después de 4 segundos
    setTimeout(() => {
        element.style.display = 'none';
    }, 4000);
}

// Función para mostrar el dashboard según el rol
function showDashboard(username) {
    currentUser = username;
    const user = users[username];
    
    // Guardar usuario actual en localStorage
    localStorage.setItem('currentUser', username);
    
    // Actualizar mensajes de bienvenida
    welcomeUser.textContent = `Bienvenido, ${username}`;
    userRoleDisplay.textContent = user.role;
    userRoleDisplay.className = `role-badge ${user.role}`;
    
    // Ocultar todos los dashboards primero
    colaboradorDashboard.style.display = 'none';
    empleadorDashboard.style.display = 'none';
    adminDashboard.style.display = 'none';
    
    // Mostrar dashboard según el rol
    if (user.role === 'colaborador') {
        colaboradorDashboard.style.display = 'block';
        document.getElementById('saldo-actual').textContent = `$${user.saldo} COP`;
        document.getElementById('dashboard-welcome').textContent = `¡Bienvenido ${username}!`;
    } else if (user.role === 'empleador') {
        empleadorDashboard.style.display = 'block';
        document.getElementById('dashboard-welcome-empleador').textContent = `¡Bienvenido ${username}!`;
    } else if (user.role === 'admin') {
        adminDashboard.style.display = 'block';
        document.getElementById('saldo-actual-admin').textContent = `$${user.saldo} COP`;
        document.getElementById('dashboard-welcome-admin').textContent = `¡Bienvenido ${username}!`;
    }
    
    // Mostrar dashboard y ocultar login
    loginPage.style.display = 'none';
    dashboardPage.style.display = 'block';
    
    // Limpiar formulario de login
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Función para volver al login
function showLogin() {
    // Limpiar usuario actual del localStorage al cerrar sesión
    localStorage.removeItem('currentUser');
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
    
    // DEBUG: Mostrar usuarios disponibles en consola
    console.log('Usuarios disponibles:', Object.keys(users));
    console.log('Usuario intentando login:', username);
    console.log('Contraseña ingresada:', password);
    console.log('Usuario existe?', users[username]);
    if (users[username]) {
        console.log('Contraseña guardada:', users[username].password);
        console.log('Contraseña coincide?', users[username].password === password);
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
    const userName = currentUser; // Guardar nombre antes de limpiar
    showLogin();
    showMessage(loginMessage, `¡Hasta pronto, ${userName}! Sesión cerrada correctamente.`, 'success');
});

// Registro de usuario
registerBtn.addEventListener('click', () => {
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const role = document.getElementById('user-role').value;
    const securityQuestion = document.getElementById('security-question').value;
    const securityAnswer = document.getElementById('security-answer').value;
    
    if (!username || !password || !role || !securityQuestion || !securityAnswer) {
        showMessage(registerMessage, 'Por favor, completa todos los campos', 'error');
        return;
    }
    
    if (users[username]) {
        showMessage(registerMessage, 'Este nombre de usuario ya está en uso', 'error');
        return;
    }
    
    if (password.length < 4) {
        showMessage(registerMessage, 'La contraseña debe tener al menos 4 caracteres', 'error');
        return;
    }
    
    // Registrar nuevo usuario
    users[username] = {
        password: password,
        role: role,
        saldo: role === 'colaborador' || role === 'admin' ? 0 : undefined,
        securityQuestion: securityQuestion,
        securityAnswer: securityAnswer.toLowerCase()
    };
    
    // GUARDAR INMEDIATAMENTE en localStorage
    saveUsersToStorage();
    
    showMessage(registerMessage, `¡Usuario ${role} registrado exitosamente!`, 'success');
    
    // Limpiar formulario
    document.getElementById('new-username').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('user-role').value = '';
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
    
    if (newPassword.length < 4) {
        showMessage(recoveryMessage, 'La contraseña debe tener al menos 4 caracteres', 'error');
        return;
    }
    
    // Actualizar contraseña y GUARDAR en localStorage
    users[username].password = newPassword;
    saveUsersToStorage();
    
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

// Funcionalidades para Colaborador
document.getElementById('buscar-tareas-btn').addEventListener('click', () => {
    localStorage.setItem('currentUser', currentUser);
    window.location.href = `colaborador.html?user=${currentUser}&section=buscar-tareas`;
});

document.getElementById('recargar-saldo-btn').addEventListener('click', () => {
    localStorage.setItem('currentUser', currentUser);
    window.location.href = `colaborador.html?user=${currentUser}&section=recargar-saldo`;
    /*const amount = prompt('Ingrese el monto a recargar (COP):');
    if (amount && !isNaN(amount) && parseInt(amount) > 0) {
        users[currentUser].saldo += parseInt(amount);
        // GUARDAR el cambio en localStorage
        saveUsersToStorage();
        document.getElementById('saldo-actual').textContent = `$${users[currentUser].saldo} COP`;
        alert(`Saldo recargado exitosamente. Nuevo saldo: $${users[currentUser].saldo} COP`);
    } else {
        alert('Por favor, ingresa un monto válido');
    }*/
});

document.getElementById('actualizar-datos-btn').addEventListener('click', () => {
    localStorage.setItem('currentUser', currentUser);
    window.location.href = `colaborador.html?user=${currentUser}&section=actualizar-datos`;
});

document.getElementById('generar-certificado-btn').addEventListener('click', () => {
    localStorage.setItem('currentUser', currentUser);
    window.location.href = `colaborador.html?user=${currentUser}&section=generar-certificado`;
});

// Funcionalidades para Empleador
document.getElementById('generar-tarea-btn').addEventListener('click', () => {
    // Guardar usuario actual antes de redirigir
    localStorage.setItem('currentUser', currentUser);
    window.location.href = `empleador.html?user=${currentUser}&section=generar-tarea`;
});

document.getElementById('calificar-colaborador-btn').addEventListener('click', () => {
    // Guardar usuario actual antes de redirigir
    localStorage.setItem('currentUser', currentUser);
    window.location.href = `empleador.html?user=${currentUser}&section=calificar-colaborador`;
});

document.getElementById('actualizar-datos-empleador-btn').addEventListener('click', () => {
    // Guardar usuario actual antes de redirigir
    localStorage.setItem('currentUser', currentUser);
    window.location.href = `empleador.html?user=${currentUser}&section=actualizar-datos`;
});

// Funcionalidades para Admin
document.getElementById('admin-buscar-tareas-btn').addEventListener('click', () => {
    localStorage.setItem('currentUser', currentUser);
    window.location.href = `colaborador.html?user=${currentUser}&section=buscar-tareas`;
});

document.getElementById('admin-recaragar-saldo-btn').addEventListener('click', () => {
    localStorage.setItem('currentUser', currentUser);
    window.location.href = `colaborador.html?user=${currentUser}&section=recargar-saldo`;
    /*const amount = prompt('Ingrese el monto a recargar (COP):');
    if (amount && !isNaN(amount) && parseInt(amount) > 0) {
        users[currentUser].saldo += parseInt(amount);
        // GUARDAR el cambio en localStorage
        saveUsersToStorage();
        document.getElementById('saldo-actual-admin').textContent = `$${users[currentUser].saldo} COP`;
        alert(`Saldo recargado exitosamente. Nuevo saldo: $${users[currentUser].saldo} COP`);
    } else {
        alert('Por favor, ingresa un monto válido');
    }*/
});

document.getElementById('admin-actualizar-datos-btn').addEventListener('click', () => {
    localStorage.setItem('currentUser', currentUser);
    window.location.href = `colaborador.html?user=${currentUser}&section=actualizar-datos`;
});

document.getElementById('admin-generar-certificado-btn').addEventListener('click', () => {
    localStorage.setItem('currentUser', currentUser);
    window.location.href = `colaborador.html?user=${currentUser}&section=generar-certificado`;
});

document.getElementById('admin-generar-tarea-btn').addEventListener('click', () => {
    // Guardar usuario actual antes de redirigir
    localStorage.setItem('currentUser', currentUser);
    window.location.href = `empleador.html?user=${currentUser}&section=generar-tarea`;
});

document.getElementById('admin-calificar-colaborador-btn').addEventListener('click', () => {
    // Guardar usuario actual antes de redirigir
    localStorage.setItem('currentUser', currentUser);
    window.location.href = `empleador.html?user=${currentUser}&section=calificar-colaborador`;
});