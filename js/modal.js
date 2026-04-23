// ============================================
// MODAL SYSTEM (IMPROVED)
// ============================================

let currentModal = null;

// ==========================
// HELPERS
// ==========================
function vibrate(pattern = 20) {
    if (navigator.vibrate) navigator.vibrate(pattern);
}

function createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    return overlay;
}

function attachModalEvents(overlay) {
    const closeBtn = overlay.querySelector('.modal-close');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeModal();
    });

    const escHandler = function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    };

    document.addEventListener('keydown', escHandler);
    overlay._escHandler = escHandler;
}

// ==========================
// CORE MODAL BUILDER
// ==========================
function buildModal(title, bodyHtml) {
    const overlay = createOverlay();

    overlay.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                ${bodyHtml}
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // trigger animation
    overlay.offsetHeight;
    overlay.classList.add('active');

    attachModalEvents(overlay);

    currentModal = overlay;

    vibrate();

    return overlay;
}

// ==========================
// PROJECT MODAL
// ==========================
function openModal(project) {
    if (currentModal) closeModal();

    const body = `
        <p>${project.fullDescription || project.description}</p>

        ${project.technologies ? `
            <div class="modal-tech">
                ${project.technologies.map(function (t) {
                    return `<span class="tech-tag">${t}</span>`;
                }).join('')}
            </div>
        ` : ''}

        <div class="modal-links">
            ${project.link && project.link !== '#' ? `
                <a href="${project.link}" target="_blank" class="modal-link">
                    🔗 Ver proyecto
                </a>
            ` : ''}

            ${project.github && project.github !== '#' ? `
                <a href="${project.github}" target="_blank" class="modal-link">
                    💻 GitHub
                </a>
            ` : ''}
        </div>
    `;

    buildModal(project.name, body);
}

// ==========================
// SKILL MODAL
// ==========================
function openSkillModal(skill) {
    if (currentModal) closeModal();

    const body = `
        <p>${skill.fullDescription}</p>

        <div class="modal-meta">
            <div>📅 ${skill.experience}</div>
            <div>📁 ${skill.projects}</div>
        </div>

        <div class="modal-tech">
            ${skill.technologies.map(function (t) {
                return `<span class="tech-tag">${t}</span>`;
            }).join('')}
        </div>
    `;

    buildModal(skill.title, body);
}

// ==========================
// CLOSE
// ==========================
function closeModal() {
    if (!currentModal) return;

    currentModal.classList.remove('active');

    if (currentModal._escHandler) {
        document.removeEventListener('keydown', currentModal._escHandler);
    }

    setTimeout(function () {
        if (currentModal && currentModal.parentNode) {
            currentModal.parentNode.removeChild(currentModal);
        }
        currentModal = null;
    }, 300);
}

// ==========================
// GLOBAL EXPORT
// ==========================
window.openModal = openModal;
window.openSkillModal = openSkillModal;
window.closeModal = closeModal;