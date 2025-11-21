// Base de datos simulada
let tareas = JSON.parse(localStorage.getItem('tareas')) || [];
let usuarios = JSON.parse(localStorage.getItem('users')) || {};
let tareasAceptadas = JSON.parse(localStorage.getItem('tareasAceptadas')) || [];
let calificaciones = JSON.parse(localStorage.getItem('calificaciones')) || [];

// Elementos del DOM
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');
const listaTareasDisponibles = document.getElementById('lista-tareas-disponibles');
const filterArea = document.getElementById('filter-area');
const searchTarea = document.getElementById('search-tarea');
const recargaForm = document.getElementById('recarga-form');
const actualizarForm = document.getElementById('actualizar-form');
const saldoActual = document.getElementById('saldo-actual');
const modal = document.getElementById('aceptar-tarea-modal');
const closeModal = document.querySelector('.close');
const cancelarAceptar = document.getElementById('cancelar-aceptar');
const confirmarAceptar = document.getElementById('confirmar-aceptar');
const logoutBtn = document.getElementById('logout-btn');
const backDashboardBtn = document.getElementById('back-dashboard-btn');
const welcomeUser = document.getElementById('welcome-user');
const generarCertificadoBtn = document.getElementById('generar-certificado-btn');

// Variables globales
let currentUser = '';
let currentTarea = null;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // Obtener usuario actual
    currentUser = getCurrentUser();
    targetSection = getTargetSection();
    
    if (!currentUser) {
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
    
    // Configurar filtros
    setupFilters();
    
    // Cargar datos
    loadTareasDisponibles();
    loadTareasProgreso();
    loadTareasCompletadasHistorial();
    loadUserData();
    loadCertificadoInfo();
    
    // Configurar botones de acción
    setupActionButtons();
    navigateToSection(targetSection);
}

function getCurrentUser() {
    const urlParams = new URLSearchParams(window.location.search);
    let user = urlParams.get('user');
    
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
        section = 'buscar-tareas';
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
    welcomeUser.textContent = `Bienvenido, ${currentUser}`;
    document.title = `WorkD@y - Panel de ${currentUser}`;
    
    // Actualizar saldo
    if (usuarios[currentUser] && usuarios[currentUser].saldo !== undefined) {
        saldoActual.textContent = `$${usuarios[currentUser].saldo} COP`;
    }
}

function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === target) {
                    section.classList.add('active');
                    
                    // Cargar datos específicos de cada sección
                    if (target === 'mis-tareas') {
                        loadTareasProgreso();
                        loadTareasCompletadasHistorial();
                    } else if (target === 'buscar-tareas') {
                        loadTareasDisponibles();
                    } else if (target === 'generar-certificado') {
                        loadCertificadoInfo();
                    }
                    // Las secciones 'recargar-saldo' y 'actualizar-datos' 
                    // no necesitan carga adicional
                }
            });
        });
    });
}

function setupForms() {
    // Formulario de recarga
    recargaForm.addEventListener('submit', function(e) {
        e.preventDefault();
        recargarSaldo();
    });

    // Formulario de actualización
    actualizarForm.addEventListener('submit', function(e) {
        e.preventDefault();
        actualizarDatos();
    });
}

function setupModal() {
    closeModal.addEventListener('click', closeAceptarModal);
    cancelarAceptar.addEventListener('click', closeAceptarModal);
    confirmarAceptar.addEventListener('click', confirmarAceptarTarea);

    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeAceptarModal();
        }
    });
}

function setupFilters() {
    filterArea.addEventListener('change', loadTareasDisponibles);
    searchTarea.addEventListener('input', loadTareasDisponibles);
}

function setupActionButtons() {
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    backDashboardBtn.addEventListener('click', function() {
        localStorage.setItem('currentUser', currentUser);
        window.location.href = 'index.html';
    });

    generarCertificadoBtn.addEventListener('click', generarCertificado);
}

// Funcionalidad de Buscar Tareas
function loadTareasDisponibles() {
    const areaFilter = filterArea.value.toLowerCase();
    const searchFilter = searchTarea.value.toLowerCase();

    // Filtrar tareas disponibles (que no han sido aceptadas por este colaborador)
    const tareasAceptadasIds = tareasAceptadas
        .filter(t => t.colaborador === currentUser)
        .map(t => t.tareaId);

    const tareasFiltradas = tareas.filter(tarea => 
        tarea.estado === 'disponible' && 
        !tareasAceptadasIds.includes(tarea.id) &&
        (areaFilter === '' || tarea.area.toLowerCase().includes(areaFilter)) &&
        (searchFilter === '' || tarea.nombre.toLowerCase().includes(searchFilter))
    );

    if (tareasFiltradas.length === 0) {
        listaTareasDisponibles.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>No se encontraron tareas disponibles</p>
                <small>Intenta con otros filtros o vuelve más tarde</small>
            </div>
        `;
        return;
    }

    listaTareasDisponibles.innerHTML = tareasFiltradas.map(tarea => `
        <div class="tarea-card">
            <div class="tarea-header">
                <div class="tarea-title">${tarea.nombre}</div>
                <div class="tarea-area">${tarea.area}</div>
            </div>
            <div class="tarea-info">
                <strong>Empleador:</strong> ${tarea.empleador} | 
                <strong>Dirección:</strong> ${tarea.direccion} | 
                <strong>Contacto:</strong> ${tarea.celular} |
                <strong>Fecha:</strong> ${tarea.fecha}
            </div>
            <div class="tarea-descripcion">
                ${tarea.descripcion}
            </div>
            <div class="tarea-actions">
                <button class="btn btn-success" onclick="abrirModalAceptarTarea(${tarea.id})">
                    <i class="fas fa-check"></i>
                    Aceptar Tarea
                </button>
            </div>
        </div>
    `).join('');
}

function abrirModalAceptarTarea(tareaId) {
    currentTarea = tareas.find(t => t.id === tareaId);
    
    if (!currentTarea) return;

    document.getElementById('tarea-modal-nombre').textContent = currentTarea.nombre;
    document.getElementById('tarea-modal-area').textContent = currentTarea.area;
    document.getElementById('tarea-modal-direccion').textContent = currentTarea.direccion;
    document.getElementById('tarea-modal-celular').textContent = currentTarea.celular;
    document.getElementById('tarea-modal-descripcion').textContent = currentTarea.descripcion;
    
    modal.style.display = 'block';
}

function closeAceptarModal() {
    modal.style.display = 'none';
    currentTarea = null;
}

function confirmarAceptarTarea() {
    if (!currentTarea) return;

    // Registrar tarea aceptada
    tareasAceptadas.push({
        tareaId: currentTarea.id,
        colaborador: currentUser,
        fechaAceptacion: new Date().toLocaleDateString('es-CO'),
        estado: 'en-progreso'
    });

    // Actualizar estado de la tarea
    const tareaIndex = tareas.findIndex(t => t.id === currentTarea.id);
    if (tareaIndex !== -1) {
        tareas[tareaIndex].estado = 'en-progreso';
    }

    // Guardar en localStorage
    localStorage.setItem('tareasAceptadas', JSON.stringify(tareasAceptadas));
    localStorage.setItem('tareas', JSON.stringify(tareas));

    // Mostrar mensaje de éxito
    showMessage('tareas-message', `¡Tarea "${currentTarea.nombre}" aceptada exitosamente!`, 'success');

    // Cerrar modal y actualizar lista
    closeAceptarModal();
    loadTareasDisponibles();
}

// Funcionalidad para marcar tarea como finalizada
function marcarTareaFinalizada(tareaId) {
    const tareaAceptadaIndex = tareasAceptadas.findIndex(t => 
        t.tareaId === tareaId && t.colaborador === currentUser
    );

    if (tareaAceptadaIndex !== -1) {
        // Actualizar estado de la tarea aceptada
        tareasAceptadas[tareaAceptadaIndex].estado = 'completada';
        tareasAceptadas[tareaAceptadaIndex].fechaFinalizacion = new Date().toLocaleDateString('es-CO');

        // Actualizar estado de la tarea original
        const tareaIndex = tareas.findIndex(t => t.id === tareaId);
        if (tareaIndex !== -1) {
            tareas[tareaIndex].estado = 'completada';
        }

        // Agregar a la lista de colaboradores pendientes de calificación
        let colaboradoresPendientes = JSON.parse(localStorage.getItem('colaboradoresPendientes')) || [];
        const tarea = tareas.find(t => t.id === tareaId);
        
        colaboradoresPendientes.push({
            colaborador: currentUser,
            tarea: tarea.nombre,
            empleador: tarea.empleador,
            fecha: new Date().toLocaleDateString('es-CO')
        });

        // Guardar en localStorage
        localStorage.setItem('tareasAceptadas', JSON.stringify(tareasAceptadas));
        localStorage.setItem('tareas', JSON.stringify(tareas));
        localStorage.setItem('colaboradoresPendientes', JSON.stringify(colaboradoresPendientes));

        // Mostrar mensaje de éxito
        showMessage('tareas-message', '¡Tarea marcada como finalizada! El empleador te calificará pronto.', 'success');

        // Actualizar listas
        loadTareasEnProgreso();
        loadTareasDisponibles();
    }
}

// Cargar tareas en progreso (para mostrar en una nueva sección)
function loadTareasEnProgreso() {
    const tareasEnProgreso = tareasAceptadas.filter(t => 
        t.colaborador === currentUser && t.estado === 'en-progreso'
    );

    const tareasCompletadas = tareasAceptadas.filter(t => 
        t.colaborador === currentUser && t.estado === 'completada'
    );

    // Actualizar el contador en el certificado
    document.getElementById('tareas-completadas').textContent = tareasCompletadas.length;
    
    // También podríamos mostrar las tareas en progreso en alguna sección
    console.log('Tareas en progreso:', tareasEnProgreso.length);
    console.log('Tareas completadas:', tareasCompletadas.length);
}

// Función para cargar tareas en progreso
function loadTareasProgreso() {
    const tareasEnProgreso = tareasAceptadas.filter(t => 
        t.colaborador === currentUser && t.estado === 'en-progreso'
    );

    const container = document.getElementById('lista-tareas-progreso');
    
    if (tareasEnProgreso.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <p>No tienes tareas en progreso</p>
                <small>Acepta tareas en la sección "Buscar Tareas"</small>
            </div>
        `;
        return;
    }

    container.innerHTML = tareasEnProgreso.map(tareaAceptada => {
        const tarea = tareas.find(t => t.id === tareaAceptada.tareaId);
        if (!tarea) return '';
        
        return `
            <div class="tarea-card">
                <div class="tarea-header">
                    <div class="tarea-title">${tarea.nombre}</div>
                    <div class="tarea-area">${tarea.area}</div>
                </div>
                <div class="tarea-info">
                    <strong>Empleador:</strong> ${tarea.empleador} | 
                    <strong>Dirección:</strong> ${tarea.direccion} |
                    <strong>Fecha aceptada:</strong> ${tareaAceptada.fechaAceptacion}
                </div>
                <div class="tarea-descripcion">
                    ${tarea.descripcion}
                </div>
                <div class="tarea-actions">
                    <button class="btn btn-success" onclick="marcarTareaFinalizada(${tarea.id})">
                        <i class="fas fa-flag-checkered"></i>
                        Marcar como Finalizada
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Función para cargar historial de tareas completadas
function loadTareasCompletadasHistorial() {
    const tareasCompletadas = tareasAceptadas.filter(t => 
        t.colaborador === currentUser && t.estado === 'completada'
    );

    const container = document.getElementById('lista-tareas-completadas-historial');
    
    if (tareasCompletadas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <p>No has completado tareas aún</p>
                <small>Las tareas que finalices aparecerán aquí</small>
            </div>
        `;
        return;
    }

    container.innerHTML = tareasCompletadas.map(tareaAceptada => {
        const tarea = tareas.find(t => t.id === tareaAceptada.tareaId);
        const calificacion = calificaciones.find(c => 
            c.tarea === tarea.nombre && c.colaborador === currentUser
        );
        
        if (!tarea) return '';
        
        return `
            <div class="tarea-card">
                <div class="tarea-header">
                    <div class="tarea-title">${tarea.nombre}</div>
                    <div class="tarea-area">${tarea.area}</div>
                </div>
                <div class="tarea-info">
                    <strong>Empleador:</strong> ${tarea.empleador} | 
                    <strong>Fecha finalizada:</strong> ${tareaAceptada.fechaFinalizacion}
                    ${calificacion ? ` | <strong>Calificación:</strong> ${'★'.repeat(calificacion.calificacion)}` : ' | <strong>Calificación:</strong> Pendiente'}
                </div>
                <div class="tarea-descripcion">
                    ${tarea.descripcion}
                </div>
            </div>
        `;
    }).join('');
}

// Funcionalidad de Recargar Saldo
function recargarSaldo() {
    const monto = parseInt(document.getElementById('monto-recarga').value);
    const metodoPago = document.getElementById('metodo-pago').value;

    if (!monto || monto < 1000) {
        showMessage('saldo-message', 'El monto mínimo de recarga es $1,000 COP', 'error');
        return;
    }

    if (!metodoPago) {
        showMessage('saldo-message', 'Selecciona un método de pago', 'error');
        return;
    }

    // Actualizar saldo
    if (!usuarios[currentUser].saldo) {
        usuarios[currentUser].saldo = 0;
    }
    usuarios[currentUser].saldo += monto;

    // Guardar en localStorage
    localStorage.setItem('users', JSON.stringify(usuarios));

    // Actualizar interfaz
    saldoActual.textContent = `$${usuarios[currentUser].saldo} COP`;

    // Mostrar mensaje de éxito
    showMessage('saldo-message', `¡Saldo recargado exitosamente! Nuevo saldo: $${usuarios[currentUser].saldo} COP`, 'success');

    // Limpiar formulario
    recargaForm.reset();
}

// Funcionalidad de Actualizar Datos
function loadUserData() {
    const user = usuarios[currentUser];
    if (user) {
        document.getElementById('actualizar-usuario').value = currentUser;
        document.getElementById('actualizar-security-question').value = user.securityQuestion || '';
        document.getElementById('actualizar-security-answer').value = user.securityAnswer || '';
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

    if (nuevaPassword && nuevaPassword.length < 6) {
        showMessage('actualizar-message', 'La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }

    if (!usuarios[currentUser]) {
        usuarios[currentUser] = {};
    }

    if (nuevaPassword) {
        usuarios[currentUser].password = nuevaPassword;
    }

    usuarios[currentUser].securityQuestion = securityQuestion;
    usuarios[currentUser].securityAnswer = securityAnswer.toLowerCase();
    usuarios[currentUser].role = 'colaborador';

    localStorage.setItem('users', JSON.stringify(usuarios));

    showMessage('actualizar-message', '¡Datos actualizados exitosamente!', 'success');
    document.getElementById('actualizar-password').value = '';
}

// Funcionalidad de Certificado
function loadCertificadoInfo() {
    // Tareas completadas por este colaborador
    const tareasCompletadas = tareasAceptadas.filter(t => 
        t.colaborador === currentUser && t.estado === 'completada'
    ).length;

    // Calificación promedio
    const calificacionesColaborador = calificaciones.filter(c => c.colaborador === currentUser);
    const promedio = calificacionesColaborador.length > 0 
        ? (calificacionesColaborador.reduce((sum, c) => sum + c.calificacion, 0) / calificacionesColaborador.length).toFixed(1)
        : '0.0';

    document.getElementById('tareas-completadas').textContent = tareasCompletadas;
    document.getElementById('calificacion-promedio').textContent = promedio;

    // Cargar lista de tareas completadas
    loadTareasCompletadas();
}

function loadTareasCompletadas() {
    const tareasCompletadasIds = tareasAceptadas
        .filter(t => t.colaborador === currentUser && t.estado === 'completada')
        .map(t => t.tareaId);

    const tareasCompletadas = tareas.filter(t => tareasCompletadasIds.includes(t.id));

    const lista = document.getElementById('lista-tareas-completadas');
    
    if (tareasCompletadas.length === 0) {
        return; // Mantener el estado vacío por defecto
    }

    lista.innerHTML = tareasCompletadas.map(tarea => {
        const calificacion = calificaciones.find(c => c.tarea === tarea.nombre && c.colaborador === currentUser);
        return `
            <div class="tarea-card">
                <div class="tarea-header">
                    <div class="tarea-title">${tarea.nombre}</div>
                    <div class="tarea-area">${tarea.area}</div>
                </div>
                <div class="tarea-info">
                    <strong>Empleador:</strong> ${tarea.empleador} | 
                    <strong>Fecha:</strong> ${tarea.fecha}
                    ${calificacion ? ` | <strong>Calificación:</strong> ${'★'.repeat(calificacion.calificacion)}` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function generarCertificado() {
    const tareasCompletadas = tareasAceptadas.filter(t => 
        t.colaborador === currentUser && t.estado === 'completada'
    ).length;

    if (tareasCompletadas === 0) {
        showMessage('certificado-message', 'Necesitas completar al menos una tarea para generar un certificado', 'error');
        return;
    }

    // Simular generación de certificado
    showMessage('certificado-message', '¡Certificado generado exitosamente! Se ha descargado tu certificado en formato PDF.', 'success');
    
    // En una implementación real, aquí se generaría y descargaría un PDF
    setTimeout(() => {
        alert('Certificado laboral generado para: ' + currentUser + '\nTareas completadas: ' + tareasCompletadas);
    }, 1000);
}

// Función utilitaria
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Hacer funciones disponibles globalmente
window.abrirModalAceptarTarea = abrirModalAceptarTarea;