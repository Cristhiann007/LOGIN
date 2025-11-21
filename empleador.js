// Base de datos simulada
let tareas = JSON.parse(localStorage.getItem('tareas')) || [];
let colaboradoresPendientes = JSON.parse(localStorage.getItem('colaboradoresPendientes')) || [];
let usuarios = JSON.parse(localStorage.getItem('users')) || {};

// Elementos del DOM
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');
const tareaForm = document.getElementById('tarea-form');
const actualizarForm = document.getElementById('actualizar-form');
const listaTareas = document.getElementById('lista-tareas');
const listaColaboradores = document.getElementById('lista-colaboradores');
const modal = document.getElementById('calificar-modal');
const closeModal = document.querySelector('.close');
const cancelarCalificacion = document.getElementById('cancelar-calificacion');
const confirmarCalificacion = document.getElementById('confirmar-calificacion');
const stars = document.querySelectorAll('.star');
const logoutBtn = document.getElementById('logout-btn');
const backDashboardBtn = document.getElementById('back-dashboard-btn');
const welcomeUser = document.getElementById('welcome-user');

// Variables globales
let currentRating = 0;
let currentColaborador = null;
let currentTarea = null;

// Obtener usuario actual y sección de la URL
let currentUser = '';
let targetSection = '';

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // Obtener usuario actual y sección
    currentUser = getCurrentUser();
    targetSection = getTargetSection();
    
    if (!currentUser) {
        // Si no hay usuario, redirigir al login
        window.location.href = 'index.html';
        return;
    }
    
    // Configurar interfaz
    setupUI();
    
    // Configurar navegación
    setupNavigation();
    
    // Configurar formularios
    setupForms();
    
    // Configurar modal
    setupModal();
    
    // Cargar datos
    loadTareas();
    loadColaboradoresPendientes();
    loadUserData();
    
    // Configurar estrellas de calificación
    setupStars();
    
    // Configurar botones de acción
    setupActionButtons();
    
    // Navegar a la sección especificada
    navigateToSection(targetSection);
    
    // Inicializar datos de ejemplo si es necesario
    initializeSampleData();
}

function getCurrentUser() {
    // Primero intentar obtener de la URL
    const urlParams = new URLSearchParams(window.location.search);
    let user = urlParams.get('user');
    
    // Si no está en la URL, intentar del localStorage
    if (!user) {
        user = localStorage.getItem('currentUser');
    }
    
    return user;
}

function getTargetSection() {
    const urlParams = new URLSearchParams(window.location.search);
    let section = urlParams.get('section');
    
    // Si no se especifica sección, usar la primera por defecto
    if (!section) {
        section = 'generar-tarea';
    }
    
    return section;
}

function navigateToSection(section) {
    // Encontrar el elemento de navegación correspondiente
    const navItem = document.querySelector(`.nav-item[data-target="${section}"]`);
    if (navItem) {
        navItem.click(); // Simular clic en el elemento de navegación
    }
}

function setupUI() {
    // Actualizar mensaje de bienvenida
    welcomeUser.textContent = `Bienvenido, ${currentUser}`;
    
    // Actualizar título de la página
    document.title = `WorkD@y - Panel de ${currentUser}`;
}

function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            
            // Actualizar navegación activa
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Mostrar sección correspondiente
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === target) {
                    section.classList.add('active');
                }
            });
        });
    });
}

function setupForms() {
    // Formulario de tarea
    tareaForm.addEventListener('submit', function(e) {
        e.preventDefault();
        generarTarea();
    });

    // Formulario de actualización
    actualizarForm.addEventListener('submit', function(e) {
        e.preventDefault();
        actualizarDatos();
    });
}

function setupModal() {
    // Cerrar modal
    closeModal.addEventListener('click', closeRatingModal);
    cancelarCalificacion.addEventListener('click', closeRatingModal);
    
    // Confirmar calificación
    confirmarCalificacion.addEventListener('click', confirmarCalificacionAction);

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeRatingModal();
        }
    });
}

function setupStars() {
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            setRating(rating);
        });
        
        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            highlightStars(rating);
        });
    });

    // Restablecer estrellas al salir del contenedor
    document.querySelector('.stars').addEventListener('mouseleave', function() {
        highlightStars(currentRating);
    });
}

function setupActionButtons() {
    // Botón de logout
    logoutBtn.addEventListener('click', function() {
        // Limpiar usuario actual del localStorage
        localStorage.removeItem('currentUser');
        // Redirigir al login
        window.location.href = 'index.html';
    });

    // Botón volver al dashboard
    backDashboardBtn.addEventListener('click', function() {
        // Guardar usuario actual antes de redirigir
        localStorage.setItem('currentUser', currentUser);
        // Redirigir al dashboard principal
        window.location.href = 'index.html';
    });
}

// Funcionalidad de Generar Tarea
function generarTarea() {
    const nombre = document.getElementById('nombre-tarea').value;
    const area = document.getElementById('area-tarea').value;
    const direccion = document.getElementById('direccion-tarea').value;
    const celular = document.getElementById('celular-tarea').value;
    const descripcion = document.getElementById('descripcion-tarea').value;

    // Validaciones básicas
    if (!nombre || !area || !direccion || !celular || !descripcion) {
        showMessage('tarea-message', 'Por favor, completa todos los campos obligatorios', 'error');
        return;
    }

    // Validar celular
    if (!/^\d{10}$/.test(celular)) {
        showMessage('tarea-message', 'El celular debe tener 10 dígitos numéricos', 'error');
        return;
    }

    // Crear nueva tarea
    const nuevaTarea = {
        id: Date.now(),
        nombre: nombre,
        area: area,
        direccion: direccion,
        celular: celular,
        descripcion: descripcion,
        empleador: currentUser,
        fecha: new Date().toLocaleDateString('es-CO'),
        hora: new Date().toLocaleTimeString('es-CO'),
        estado: 'disponible'
    };

    // Agregar a la lista
    tareas.push(nuevaTarea);
    saveTareas();

    // Mostrar mensaje de éxito
    showMessage('tarea-message', '¡Tarea generada exitosamente!', 'success');

    // Limpiar formulario
    tareaForm.reset();

    // Actualizar lista
    loadTareas();
}

function saveTareas() {
    localStorage.setItem('tareas', JSON.stringify(tareas));
}

function loadTareas() {
    const tareasEmpleador = tareas.filter(tarea => tarea.empleador === currentUser);
    
    if (tareasEmpleador.length === 0) {
        listaTareas.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <p>No has generado ninguna tarea aún</p>
                <small>Las tareas que generes aparecerán aquí</small>
            </div>
        `;
        return;
    }

    listaTareas.innerHTML = tareasEmpleador.map(tarea => `
        <div class="tarea-card">
            <div class="tarea-header">
                <div class="tarea-title">${tarea.nombre}</div>
                <div class="tarea-area">${tarea.area}</div>
            </div>
            <div class="tarea-info">
                <strong>Dirección:</strong> ${tarea.direccion} | 
                <strong>Contacto:</strong> ${tarea.celular} |
                <strong>Fecha:</strong> ${tarea.fecha} ${tarea.hora}
            </div>
            <div class="tarea-descripcion">
                ${tarea.descripcion}
            </div>
            <div class="tarea-status">
                <span class="status-badge ${tarea.estado}">${tarea.estado}</span>
            </div>
        </div>
    `).join('');
}

// Funcionalidad de Calificar Colaborador
function loadColaboradoresPendientes() {
    const colaboradores = colaboradoresPendientes.filter(col => col.empleador === currentUser);
    
    if (colaboradores.length === 0) {
        listaColaboradores.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <p>No hay colaboradores para calificar aún</p>
                <small>Los colaboradores aparecerán aquí cuando completen tus tareas</small>
            </div>
        `;
        return;
    }

    listaColaboradores.innerHTML = colaboradores.map(col => `
        <div class="colaborador-card">
            <div class="colaborador-info">
                <h4>${col.colaborador}</h4>
                <p>Tarea completada: ${col.tarea}</p>
                <small>Fecha: ${col.fecha || 'No especificada'}</small>
            </div>
            <button class="btn-calificar" onclick="abrirModalCalificacion('${col.colaborador}', '${col.tarea}')">
                <i class="fas fa-star"></i>
                Calificar
            </button>
        </div>
    `).join('');
}

function abrirModalCalificacion(colaborador, tarea) {
    currentColaborador = colaborador;
    currentTarea = tarea;
    
    document.getElementById('colaborador-nombre').textContent = colaborador;
    document.getElementById('tarea-nombre').textContent = tarea;
    
    // Resetear calificación
    currentRating = 0;
    highlightStars(0);
    document.getElementById('rating-text').textContent = 'Selecciona una calificación';
    
    modal.style.display = 'block';
}

function closeRatingModal() {
    modal.style.display = 'none';
    currentColaborador = null;
    currentTarea = null;
    currentRating = 0;
}

function setRating(rating) {
    currentRating = rating;
    highlightStars(rating);
    
    // Actualizar texto descriptivo
    const ratingTexts = [
        'Muy malo',
        'Malo',
        'Regular',
        'Bueno',
        'Excelente'
    ];
    document.getElementById('rating-text').textContent = ratingTexts[rating - 1] || 'Selecciona una calificación';
}

function highlightStars(rating) {
    stars.forEach(star => {
        const starRating = parseInt(star.getAttribute('data-rating'));
        if (starRating <= rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function confirmarCalificacionAction() {
    if (currentRating === 0) {
        alert('Por favor, selecciona una calificación');
        return;
    }

    // Guardar calificación
    guardarCalificacion(currentColaborador, currentTarea, currentRating);

    // Mostrar mensaje de éxito
    showMessage('calificacion-message', `¡Colaborador ${currentColaborador} calificado con ${currentRating} estrellas!`, 'success');

    // Cerrar modal y actualizar lista
    closeRatingModal();
    loadColaboradoresPendientes();
}

function guardarCalificacion(colaborador, tarea, calificacion) {
    // Remover de pendientes
    colaboradoresPendientes = colaboradoresPendientes.filter(col => 
        !(col.colaborador === colaborador && col.tarea === tarea)
    );
    localStorage.setItem('colaboradoresPendientes', JSON.stringify(colaboradoresPendientes));

    // Guardar en calificaciones (nueva estructura)
    let calificaciones = JSON.parse(localStorage.getItem('calificaciones')) || [];
    calificaciones.push({
        colaborador: colaborador,
        tarea: tarea,
        empleador: currentUser,
        calificacion: calificacion,
        fecha: new Date().toLocaleDateString('es-CO')
    });
    localStorage.setItem('calificaciones', JSON.stringify(calificaciones));
}

// Funcionalidad de Actualizar Datos
function loadUserData() {
    const user = usuarios[currentUser];
    if (user) {
        document.getElementById('actualizar-usuario').value = currentUser;
        document.getElementById('actualizar-security-question').value = user.securityQuestion || '';
        document.getElementById('actualizar-security-answer').value = user.securityAnswer || '';
    } else {
        // Si el usuario no existe en la base de datos, crearlo
        usuarios[currentUser] = {
            password: '123456',
            role: 'empleador',
            securityQuestion: '¿Cuál es tu color favorito?',
            securityAnswer: 'azul'
        };
        saveUsers();
    }
}

function actualizarDatos() {
    const nuevaPassword = document.getElementById('actualizar-password').value;
    const securityQuestion = document.getElementById('actualizar-security-question').value;
    const securityAnswer = document.getElementById('actualizar-security-answer').value;

    if (!securityQuestion || !securityAnswer) {
        showMessage('actualizar-message', 'Por favor, completa la pregunta y respuesta de seguridad', 'error');
        return;
    }

    // Validar contraseña si se proporciona
    if (nuevaPassword && nuevaPassword.length < 6) {
        showMessage('actualizar-message', 'La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }

    // Actualizar datos del usuario
    if (!usuarios[currentUser]) {
        usuarios[currentUser] = {};
    }

    if (nuevaPassword) {
        usuarios[currentUser].password = nuevaPassword;
    }

    usuarios[currentUser].securityQuestion = securityQuestion;
    usuarios[currentUser].securityAnswer = securityAnswer.toLowerCase();
    usuarios[currentUser].role = 'empleador'; // Asegurar el rol

    // Guardar en localStorage
    saveUsers();

    // Mostrar mensaje de éxito
    showMessage('actualizar-message', '¡Datos actualizados exitosamente!', 'success');

    // Limpiar campo de contraseña
    document.getElementById('actualizar-password').value = '';
}

function saveUsers() {
    localStorage.setItem('users', JSON.stringify(usuarios));
}

// Función utilitaria para mostrar mensajes
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Datos de ejemplo para demostración
function initializeSampleData() {
    // Solo inicializar si no hay datos existentes
    if (colaboradoresPendientes.length === 0) {
        colaboradoresPendientes = [
            {
                colaborador: 'juan_perez',
                tarea: 'Pintar oficina principal',
                empleador: currentUser,
                fecha: new Date().toLocaleDateString('es-CO')
            },
            {
                colaborador: 'maria_garcia',
                tarea: 'Reparación eléctrica',
                empleador: currentUser,
                fecha: new Date().toLocaleDateString('es-CO')
            }
        ];
        localStorage.setItem('colaboradoresPendientes', JSON.stringify(colaboradoresPendientes));
    }
}

// Hacer funciones disponibles globalmente para los eventos onclick
window.abrirModalCalificacion = abrirModalCalificacion;