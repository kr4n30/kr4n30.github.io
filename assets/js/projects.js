// ============================================
// KR4N30 v13.0 - GESTIÓN DE PROYECTOS MEJORADA
// ============================================

const PROJECTS_CONFIG = {
    PROJECTS_JSON: 'assets/data/projects.json',
    COUNTER_DURATION: 2000,
    SEARCH_DEBOUNCE: 250
};

let PROJECTS_DATA = null;
let searchDebounceTimer = null;

// ============================================
// STATE SYSTEM
// ============================================

const projectsState = {
    filter: 'all',
    search: '',
    currentIndex: 0
};

// ============================================
// ESCAPE HTML (MEJORADO)
// ============================================

function escapeHtml(str) {
    if (!str) return '';
    const htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return String(str).replace(/[&<>"']/g, match => htmlEscapes[match]);
}

// ============================================
// URL SEGURA (SIMPLIFICADA)
// ============================================

function safeUrl(url) {
    try {
        const u = new URL(url, location.origin);
        return ['http:', 'https:'].includes(u.protocol) ? u.href : '#';
    } catch {
        return '#';
    }
}

// ============================================
// OBTENER TEXTO TRADUCIDO
// ============================================

function getProjectText(project, field) {
    if (!project) return '';
    const value = project[field];
    if (value && typeof value === 'object') {
        const currentLang = localStorage.getItem('language') || 'es';
        return value[currentLang] || value['es'] || '';
    }
    if (typeof value === 'string') return value;
    if (value !== undefined && value !== null) return String(value);
    return '';
}

// ============================================
// CONTADORES DE ESTADÍSTICAS
// ============================================

function animateCounter(element, target, duration) {
    if (!element) return;
    if (duration === undefined) duration = PROJECTS_CONFIG.COUNTER_DURATION;
    const start = performance.now();

    function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        element.textContent = Math.floor(progress * target);
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

function setupStatsObserver() {
    const statsSection = document.getElementById('heroStats');
    if (!statsSection) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && PROJECTS_DATA) {
                animateCounter(document.getElementById('stat-projects'), PROJECTS_DATA.length || PROJECTS_DATA.projects?.length || 0);
                observer.disconnect();
            }
        });
    }, { threshold: 0.3 });
    observer.observe(statsSection);
}

// ============================================
// CARGA DE PROYECTOS
// ============================================

async function loadProjects() {
    if (PROJECTS_DATA) return PROJECTS_DATA;
    try {
        const response = await fetch(PROJECTS_CONFIG.PROJECTS_JSON, { cache: 'force-cache' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        PROJECTS_DATA = await response.json();
        window.PROJECTS_DATA = PROJECTS_DATA;
        return PROJECTS_DATA;
    } catch (error) {
        console.error('Error loading projects:', error);
        return null;
    }
}

// ============================================
// FILTRADO
// ============================================

function getFilteredProjects() {
    if (!PROJECTS_DATA) return [];
    const projects = Array.isArray(PROJECTS_DATA) ? PROJECTS_DATA : (PROJECTS_DATA.projects || []);
    let filtered = [...projects];

    if (projectsState.filter !== 'all') {
        filtered = filtered.filter(p => p.category === projectsState.filter);
    }

    if (projectsState.search) {
        filtered = filtered.filter(p => {
            const title = getProjectText(p, 'title') || p.title || '';
            const description = getProjectText(p, 'description') || p.description || '';
            return title.toLowerCase().indexOf(projectsState.search) !== -1 ||
                description.toLowerCase().indexOf(projectsState.search) !== -1 ||
                (p.category && p.category.toLowerCase().indexOf(projectsState.search) !== -1);
        });
    }
    return filtered;
}

// ============================================
// RENDERIZADO DE TARJETAS
// ============================================

async function renderProjects() {
    const filtered = getFilteredProjects();
    const container = document.getElementById('portfolioGrid');
    if (!container) return;

    if (filtered.length === 0) {
        container.innerHTML = '<div class="loading-projects"><p style="color:#007BFF">✨ No se encontraron proyectos</p></div>';
        return;
    }

    let html = '';
    for (const project of filtered) {
        const title = getProjectText(project, 'title') || project.title || 'Sin título';
        const description = getProjectText(project, 'description') || project.description || '';
        const projectImage = project.image || '';

        // Usar tags o technologies
        const technologies = project.tags || project.technologies || [];
        let techHtml = '';
        for (let t = 0; t < Math.min(technologies.length, 3); t++) {
            techHtml += `<span class="tech-badge">${escapeHtml(technologies[t])}</span>`;
        }

        let shortDescription = description;
        if (description && description.length > 100) {
            shortDescription = description.substring(0, 100) + '...';
        } else if (!description) {
            shortDescription = 'Sin descripción';
        }

        const year = project.date ? project.date.substring(0, 4) : (project.year || '2024');
        const client = project.client || (project.link ? 'Ver proyecto' : '');

        html += `
            <div class="project-card" data-id="${project.id}">
                <div class="project-image">
                    <img src="${escapeHtml(projectImage)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async" 
                         onerror="this.parentElement.innerHTML='<div style=\'display:flex;align-items:center;justify-content:center;height:100%\'><i class=\'fas fa-cube\' style=\'font-size:3rem;color:#007BFF\'></i></div>'">
                </div>
                <div class="project-info">
                    <h3 class="project-title">${escapeHtml(title)}</h3>
                    <span class="project-category">${escapeHtml(project.category || '')}</span>
                    <div class="project-meta">
                        <span><i class="fas fa-calendar"></i> ${escapeHtml(year)}</span>
                        ${client ? `<span><i class="fas fa-external-link-alt"></i> ${escapeHtml(client)}</span>` : ''}
                    </div>
                    <p style="color:var(--text-secondary);font-size:0.85rem">${escapeHtml(shortDescription)}</p>
                    <div class="project-tech">${techHtml}</div>
                    <button class="project-view-more" data-id="${project.id}">
                        <span>Ver más</span> <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;

    // Event listeners para botones "Ver más"
    const viewMoreBtns = document.querySelectorAll('.project-view-more');
    viewMoreBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showProjectModal(Number(btn.dataset.id));
        });
    });
}

// ============================================
// SCROLL REVEAL
// ============================================

function setupScrollReveal() {
    const cards = document.querySelectorAll('.project-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => observer.observe(card));
}

// ============================================
// MODAL
// ============================================

function showProjectModal(id) {
    const filtered = getFilteredProjects();
    const index = filtered.findIndex(p => p.id === id);
    if (index === -1) return;
    projectsState.currentIndex = index;
    updateModalContent(filtered[projectsState.currentIndex]);
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        const closeBtn = document.getElementById('modalClose');
        if (closeBtn) closeBtn.focus();
    }
}

function updateModalContent(project) {
    const modalContent = document.getElementById('modalContent');
    if (!modalContent) return;

    const title = getProjectText(project, 'title') || project.title || 'Sin título';
    const description = getProjectText(project, 'description') || project.description || '';
    const fullDescription = getProjectText(project, 'fullDescription') || description;
    const tFunc = window.t || (x => x);

    const technologies = project.tags || project.technologies || [];
    let techHtml = '';
    for (const tech of technologies) {
        techHtml += `<span class="tech-badge">${escapeHtml(tech)}</span>`;
    }

    const features = project.features || [];
    let featuresHtml = '';
    for (const feature of features) {
        featuresHtml += `<li style="background:rgba(0,123,255,0.08);padding:0.3rem 1rem;border-radius:50px">✓ ${escapeHtml(feature)}</li>`;
    }

    const year = project.date ? project.date.substring(0, 4) : (project.year || '2024');
    const linkUrl = project.demoUrl || project.link || '#';

    modalContent.innerHTML = `
        <div class="modal-header">
            <div class="modal-image"><img src="${escapeHtml(project.image || '')}" alt="${escapeHtml(title)}" loading="lazy" 
                 onerror="this.parentElement.innerHTML='<i class=\'fas fa-cube\' style=\'font-size:3rem;color:#007BFF\'></i>'"></div>
            <div><h2 class="modal-title">${escapeHtml(title)}</h2><span class="project-category">${escapeHtml(project.category || '')}</span></div>
        </div>
        <div class="modal-meta">
            <div class="modal-meta-item"><strong>${tFunc('modal.year') || 'AÑO'}</strong>${escapeHtml(year)}</div>
            ${project.link ? `<div class="modal-meta-item"><strong>PROYECTO</strong><a href="${safeUrl(project.link)}" target="_blank">Ver online</a></div>` : ''}
        </div>
        <p><strong>${tFunc('modal.description') || 'Descripción'}:</strong> ${escapeHtml(description)}</p>
        ${fullDescription !== description ? `<div style="background:rgba(0,123,255,0.05);padding:1.5rem;border-radius:20px;margin:1rem 0;border-left:3px solid #007BFF"><p>${escapeHtml(fullDescription)}</p></div>` : ''}
        <div><strong>${tFunc('modal.technologies') || 'Tecnologías utilizadas'}:</strong></div>
        <div class="project-tech" style="margin-top:0.5rem">${techHtml}</div>
        ${featuresHtml ? `<div style="margin-top:1rem"><strong>${tFunc('modal.features') || 'Características principales'}:</strong></div>
        <ul style="display:flex;flex-wrap:wrap;gap:0.5rem;list-style:none;margin-top:0.5rem">${featuresHtml}</ul>` : ''}
        <div style="display:flex;gap:1rem;margin-top:1.5rem;flex-wrap:wrap">
            <a href="${safeUrl(linkUrl)}" target="_blank" rel="noopener noreferrer" class="modal-link" 
               style="background:linear-gradient(135deg,#007BFF,#0056b3);color:#fff;padding:0.8rem 1.5rem;border-radius:50px;text-decoration:none">
               ${tFunc('modal.demo_btn') || 'Ver proyecto'} →
            </a>
        </div>
    `;
}

function navigateModal(direction) {
    const filtered = getFilteredProjects();
    if (filtered.length === 0) return;
    projectsState.currentIndex = (projectsState.currentIndex + direction + filtered.length) % filtered.length;
    updateModalContent(filtered[projectsState.currentIndex]);
}

// ============================================
// FILTROS UI
// ============================================

function setupFilters() {
    if (!PROJECTS_DATA) return;
    const projects = Array.isArray(PROJECTS_DATA) ? PROJECTS_DATA : (PROJECTS_DATA.projects || []);
    const categories = ['all'];
    const categorySet = {};

    for (const project of projects) {
        const cat = project.category;
        if (cat && !categorySet[cat]) {
            categorySet[cat] = true;
            categories.push(cat);
        }
    }

    const filterContainer = document.getElementById('portfolioFilters');
    if (!filterContainer) return;
    const allText = (window.t && window.t('portfolio.filter_all')) || 'Todos';

    let html = '';
    for (const cat of categories) {
        const activeClass = (cat === 'all') ? 'active' : '';
        const displayName = (cat === 'all') ? allText : cat;
        html += `<button class="filter-btn ${activeClass}" data-filter="${cat}">${displayName}</button>`;
    }
    filterContainer.innerHTML = html;

    // Event delegation para filtros
    filterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;

        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        projectsState.filter = btn.dataset.filter;
        renderProjects();
        setTimeout(setupScrollReveal, 100);
    });
}

// ============================================
// DEBOUNCE UTILITY
// ============================================

function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// ============================================
// BÚSQUEDA
// ============================================

function setupSearch() {
    const searchInput = document.getElementById('projectSearch');
    if (!searchInput) return;

    const debouncedSearch = debounce(() => {
        projectsState.search = searchInput.value.toLowerCase();
        renderProjects();
        setTimeout(setupScrollReveal, 100);
    }, PROJECTS_CONFIG.SEARCH_DEBOUNCE);

    searchInput.addEventListener('input', debouncedSearch);
}

// ============================================
// MODAL EVENTOS
// ============================================

function setupModalEvents() {
    const modal = document.getElementById('projectModal');
    const closeModal = () => {
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    const modalClose = document.getElementById('modalClose');
    if (modalClose) modalClose.addEventListener('click', closeModal);

    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    const modalPrev = document.getElementById('modalPrev');
    if (modalPrev) modalPrev.addEventListener('click', () => navigateModal(-1));

    const modalNext = document.getElementById('modalNext');
    if (modalNext) modalNext.addEventListener('click', () => navigateModal(1));

    document.addEventListener('keydown', (e) => {
        if (!modal || !modal.classList.contains('active')) return;
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') navigateModal(-1);
        if (e.key === 'ArrowRight') navigateModal(1);
    });
}

// ============================================
// EVENT DELEGATION PARA CARDS
// ============================================

function setupEventDelegation() {
    const container = document.getElementById('portfolioGrid');
    if (container) {
        container.addEventListener('click', (e) => {
            const card = e.target.closest('.project-card');
            if (card && !e.target.classList.contains('project-view-more')) {
                showProjectModal(Number(card.dataset.id));
            }
        });
    }
}

// ============================================
// IDIOMA
// ============================================

function setupLanguageListener() {
    document.addEventListener('languageChanged', () => {
        setupFilters();
        renderProjects();
        setTimeout(setupScrollReveal, 100);
        const searchInput = document.getElementById('projectSearch');
        if (searchInput && searchInput.placeholder) {
            searchInput.placeholder = (window.t && window.t('portfolio.search_placeholder')) || '🔍 Buscar proyecto...';
        }
    });
}

// ============================================
// INICIALIZACIÓN
// ============================================

async function initProjects() {
    await loadProjects();
    if (PROJECTS_DATA) {
        setupFilters();
        renderProjects();
        setupStatsObserver();
        setTimeout(setupScrollReveal, 100);
    }
    setupEventDelegation();
    setupSearch();
    setupModalEvents();
    setupLanguageListener();
}

window.renderProjects = renderProjects;
window.setupFilters = setupFilters;
initProjects();