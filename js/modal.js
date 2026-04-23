// ============================================
// MODAL SYSTEM
// ============================================

let currentModal = null;

/**
 * Abre un modal con información del proyecto
 * @param {Object} project - Datos del proyecto
 * @param {string} project.name - Nombre del proyecto
 * @param {string} project.description - Descripción corta
 * @param {string} project.fullDescription - Descripción completa
 * @param {Array} project.technologies - Tecnologías usadas
 * @param {string} project.link - Enlace del proyecto (opcional)
 * @param {string} project.github - Enlace de GitHub (opcional)
 */
function openModal(project) {
    // Cerrar modal existente si hay uno
    if (currentModal) {
        closeModal();
    }

    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    // Crear contenido del modal
    const modalHtml = `
        <div class="modal-container">
            <div class="modal-header">
                <h2>${project.name}</h2>
                <button class="modal-close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <p>${project.fullDescription || project.description}</p>
                ${project.technologies ? `
                    <div class="modal-tech">
                        ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="modal-links">
                    ${project.link ? `
                        <a href="${project.link}" target="_blank" class="modal-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15 3 21 3 21 9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                            Ver proyecto
                        </a>
                    ` : ''}
                    ${project.github ? `
                        <a href="${project.github}" target="_blank" class="modal-link">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.21.68-.48 0-.24-.01-.88-.01-1.72-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48C19.13 20.17 22 16.42 22 12c0-5.52-4.48-10-10-10z"/>
                            </svg>
                            GitHub
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    overlay.innerHTML = modalHtml;
    document.body.appendChild(overlay);
    
    // Forzar reflow para la animación
    overlay.offsetHeight;
    overlay.classList.add('active');
    
    currentModal = overlay;
    
    // Eventos de cierre
    const closeBtn = overlay.querySelector('.modal-close');
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    });
    
    // Cerrar con tecla ESC
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
    overlay.escHandler = escHandler;
    
    // Feedback háptico
    if (navigator.vibrate) navigator.vibrate(20);
}

/**
 * Cierra el modal actual
 */
function closeModal() {
    if (currentModal) {
        currentModal.classList.remove('active');
        if (currentModal.escHandler) {
            document.removeEventListener('keydown', currentModal.escHandler);
        }
        setTimeout(() => {
            if (currentModal && currentModal.parentNode) {
                currentModal.parentNode.removeChild(currentModal);
            }
            currentModal = null;
        }, 300);
    }
}

// Exponer funciones globalmente
window.openModal = openModal;
window.closeModal = closeModal;