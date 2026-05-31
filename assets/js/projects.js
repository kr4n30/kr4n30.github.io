// ============================================
// KR4N30 v12.0 - GESTIÓN DE PROYECTOS
// ============================================

var PROJECTS_CONFIG = {
    PROJECTS_JSON: 'assets/data/projects.json',
    COUNTER_DURATION: 2000,
    SEARCH_DEBOUNCE: 250
};

var PROJECTS_DATA = null;
var currentFilter = 'all';
var currentSearch = '';
var currentIndex = 0;
var searchDebounceTimer = null;

// ============================================
// ESCAPE HTML
// ============================================

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    if (typeof str !== 'string') {
        str = String(str);
    }
    if (!str) return '';
    return str.replace(/[&<>]/g, function (m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ============================================
// URL SEGURA
// ============================================

function safeUrl(url) {
    if (!url || url === '#') return '#';
    try {
        var parsed = new URL(url, window.location.origin);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            return parsed.href;
        }
        return '#';
    } catch (e) {
        return '#';
    }
}

// ============================================
// OBTENER TEXTO TRADUCIDO
// ============================================

function getProjectText(project, field) {
    if (!project) return '';
    var value = project[field];
    if (value && typeof value === 'object') {
        var currentLang = localStorage.getItem('language') || 'es';
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
    var start = performance.now();

    function update(now) {
        var progress = Math.min((now - start) / duration, 1);
        element.textContent = Math.floor(progress * target);
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

function setupStatsObserver() {
    var statsSection = document.getElementById('heroStats');
    if (!statsSection) return;
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting && PROJECTS_DATA) {
                animateCounter(document.getElementById('stat-projects'), PROJECTS_DATA.stats.totalProjects);
                animateCounter(document.getElementById('stat-clients'), PROJECTS_DATA.stats.clients);
                animateCounter(document.getElementById('stat-tech'), PROJECTS_DATA.stats.totalTechnologies);
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
        var response = await fetch(PROJECTS_CONFIG.PROJECTS_JSON, { cache: 'force-cache' });
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
    var filtered = PROJECTS_DATA.projects.slice();
    if (currentFilter !== 'all') {
        filtered = filtered.filter(function (p) { return p.category === currentFilter; });
    }
    if (currentSearch) {
        filtered = filtered.filter(function (p) {
            var title = getProjectText(p, 'title');
            var description = getProjectText(p, 'description');
            return title.toLowerCase().indexOf(currentSearch) !== -1 ||
                description.toLowerCase().indexOf(currentSearch) !== -1 ||
                (p.category && p.category.toLowerCase().indexOf(currentSearch) !== -1);
        });
    }
    return filtered;
}

// ============================================
// RENDERIZADO DE TARJETAS (con botón Ver más)
// ============================================

async function renderProjects() {
    var filtered = getFilteredProjects();
    var container = document.getElementById('portfolioGrid');
    if (!container) return;

    if (filtered.length === 0) {
        container.innerHTML = '<div class="loading-projects"><p style="color:#007BFF">✨ No se encontraron proyectos</p></div>';
        return;
    }

    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var project = filtered[i];
        var title = getProjectText(project, 'title');
        var description = getProjectText(project, 'description');

        var techHtml = '';
        if (project.technologies && Array.isArray(project.technologies)) {
            for (var t = 0; t < Math.min(project.technologies.length, 3); t++) {
                techHtml += '<span class="tech-badge">' + escapeHtml(project.technologies[t]) + '</span>';
            }
        }

        var shortDescription = description;
        if (description && description.length > 100) {
            shortDescription = description.substring(0, 100) + '...';
        } else if (!description) {
            shortDescription = 'Sin descripción';
        }

        html += '<div class="project-card" data-id="' + project.id + '">' +
            '<div class="project-image">' +
            '<img src="' + (project.image || '') + '" alt="' + escapeHtml(title) + '" loading="lazy" decoding="async" ' +
            'onerror="this.parentElement.innerHTML=\'<div style=\\\'display:flex;align-items:center;justify-content:center;height:100%\\\'><i class=\\\'fas fa-cube\\\' style=\\\'font-size:3rem;color:#007BFF\\\'></i></div>\'">' +
            '</div>' +
            '<div class="project-info">' +
            '<h3 class="project-title">' + escapeHtml(title) + '</h3>' +
            '<span class="project-category">' + escapeHtml(project.category || '') + '</span>' +
            '<div class="project-meta">' +
            '<span><i class="fas fa-user"></i> ' + escapeHtml(project.client || '') + '</span>' +
            '<span><i class="fas fa-calendar"></i> ' + escapeHtml(project.year || '') + '</span>' +
            '</div>' +
            '<p style="color:var(--text-secondary);font-size:0.85rem">' + escapeHtml(shortDescription) + '</p>' +
            '<div class="project-tech">' + techHtml + '</div>' +
            '<button class="project-view-more" data-id="' + project.id + '">' +
            '<span>Ver más</span> <i class="fas fa-arrow-right"></i>' +
            '</button>' +
            '</div>' +
            '</div>';
    }
    container.innerHTML = html;

    // Agregar event listeners a los botones "Ver más"
    var viewMoreBtns = document.querySelectorAll('.project-view-more');
    for (var i = 0; i < viewMoreBtns.length; i++) {
        viewMoreBtns[i].addEventListener('click', function (e) {
            e.stopPropagation();
            var id = Number(this.dataset.id);
            showProjectModal(id);
        });
    }
}

// ============================================
// MODAL
// ============================================

function showProjectModal(id) {
    var filtered = getFilteredProjects();
    var index = -1;
    for (var i = 0; i < filtered.length; i++) {
        if (filtered[i].id === id) {
            index = i;
            break;
        }
    }
    if (index === -1) return;
    currentIndex = index;
    updateModalContent(filtered[currentIndex]);
    var modal = document.getElementById('projectModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        var closeBtn = document.getElementById('modalClose');
        if (closeBtn) closeBtn.focus();
    }
}

function updateModalContent(project) {
    var modalContent = document.getElementById('modalContent');
    if (!modalContent) return;

    var title = getProjectText(project, 'title');
    var description = getProjectText(project, 'description');
    var fullDescription = getProjectText(project, 'fullDescription');
    var tFunc = window.t || function (x) { return x; };

    var techHtml = '';
    if (project.technologies && Array.isArray(project.technologies)) {
        for (var i = 0; i < project.technologies.length; i++) {
            techHtml += '<span class="tech-badge">' + escapeHtml(project.technologies[i]) + '</span>';
        }
    }

    var featuresHtml = '';
    if (project.features && Array.isArray(project.features)) {
        for (var f = 0; f < project.features.length; f++) {
            featuresHtml += '<li style="background:rgba(0,123,255,0.08);padding:0.3rem 1rem;border-radius:50px">✓ ' + escapeHtml(project.features[f]) + '</li>';
        }
    }

    modalContent.innerHTML =
        '<div class="modal-header">' +
        '<div class="modal-image"><img src="' + (project.image || '') + '" alt="' + escapeHtml(title) + '" loading="lazy" ' +
        'onerror="this.parentElement.innerHTML=\'<i class=\\\'fas fa-cube\\\' style=\\\'font-size:3rem;color:#007BFF\\\'></i>\'"></div>' +
        '<div><h2 class="modal-title">' + escapeHtml(title) + '</h2><span class="project-category">' + escapeHtml(project.category || '') + '</span></div>' +
        '</div>' +
        '<div class="modal-meta">' +
        '<div class="modal-meta-item"><strong>' + (tFunc('modal.client') || 'CLIENTE') + '</strong>' + escapeHtml(project.client || '') + '</div>' +
        '<div class="modal-meta-item"><strong>' + (tFunc('modal.duration') || 'DURACIÓN') + '</strong>' + escapeHtml(project.duration || '') + '</div>' +
        '<div class="modal-meta-item"><strong>' + (tFunc('modal.role') || 'ROL') + '</strong>' + escapeHtml(project.role || '') + '</div>' +
        '<div class="modal-meta-item"><strong>' + (tFunc('modal.status') || 'ESTADO') + '</strong>' + escapeHtml(project.status || '') + '</div>' +
        '<div class="modal-meta-item"><strong>' + (tFunc('modal.year') || 'AÑO') + '</strong>' + escapeHtml(project.year || '') + '</div>' +
        '</div>' +
        '<p><strong>' + (tFunc('modal.description') || 'Descripción') + ':</strong> ' + escapeHtml(description) + '</p>' +
        '<div style="background:rgba(0,123,255,0.05);padding:1.5rem;border-radius:20px;margin:1rem 0;border-left:3px solid #007BFF">' +
        '<p>' + escapeHtml(fullDescription) + '</p>' +
        '</div>' +
        '<div><strong>' + (tFunc('modal.technologies') || 'Tecnologías utilizadas') + ':</strong></div>' +
        '<div class="project-tech" style="margin-top:0.5rem">' + techHtml + '</div>' +
        '<div style="margin-top:1rem"><strong>' + (tFunc('modal.features') || 'Características principales') + ':</strong></div>' +
        '<ul style="display:flex;flex-wrap:wrap;gap:0.5rem;list-style:none;margin-top:0.5rem">' + featuresHtml + '</ul>' +
        '<div style="display:flex;gap:1rem;margin-top:1.5rem;flex-wrap:wrap">' +
        '<a href="' + safeUrl(project.demoUrl) + '" target="_blank" rel="noopener noreferrer" class="modal-link" ' +
        'style="background:linear-gradient(135deg,#007BFF,#0056b3);color:#fff;padding:0.8rem 1.5rem;border-radius:50px;text-decoration:none">' +
        (tFunc('modal.demo_btn') || 'Ver demo') + ' →</a>' +
        '<a href="' + safeUrl(project.githubUrl) + '" target="_blank" rel="noopener noreferrer" class="modal-link" ' +
        'style="background:transparent;border:1px solid #007BFF;color:#007BFF;padding:0.8rem 1.5rem;border-radius:50px;text-decoration:none">' +
        (tFunc('modal.github_btn') || 'Código fuente') + '</a>' +
        '</div>';
}

function navigateModal(direction) {
    var filtered = getFilteredProjects();
    if (filtered.length === 0) return;
    currentIndex = (currentIndex + direction + filtered.length) % filtered.length;
    updateModalContent(filtered[currentIndex]);
}

// ============================================
// FILTROS UI
// ============================================

function setupFilters() {
    if (!PROJECTS_DATA) return;
    var categories = ['all'];
    var categorySet = {};
    for (var i = 0; i < PROJECTS_DATA.projects.length; i++) {
        var cat = PROJECTS_DATA.projects[i].category;
        if (cat && !categorySet[cat]) {
            categorySet[cat] = true;
            categories.push(cat);
        }
    }
    var filterContainer = document.getElementById('portfolioFilters');
    if (!filterContainer) return;
    var allText = (window.t && window.t('portfolio.filter_all')) || 'Todos';

    var html = '';
    for (var c = 0; c < categories.length; c++) {
        var cat = categories[c];
        var activeClass = (cat === 'all') ? 'active' : '';
        var displayName = (cat === 'all') ? allText : cat;
        html += '<button class="filter-btn ' + activeClass + '" data-filter="' + cat + '">' + displayName + '</button>';
    }
    filterContainer.innerHTML = html;
}

// ============================================
// EVENTOS GLOBALES
// ============================================

function setupEventDelegation() {
    var container = document.getElementById('portfolioGrid');
    if (container) {
        container.addEventListener('click', function (e) {
            var card = e.target.closest('.project-card');
            if (card && !e.target.classList.contains('project-view-more')) {
                showProjectModal(Number(card.dataset.id));
            }
        });
    }

    var filterContainer = document.getElementById('portfolioFilters');
    if (filterContainer) {
        filterContainer.addEventListener('click', function (e) {
            var btn = e.target.closest('.filter-btn');
            if (!btn) return;
            var btns = document.querySelectorAll('.filter-btn');
            for (var i = 0; i < btns.length; i++) {
                btns[i].classList.remove('active');
            }
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderProjects();
        });
    }
}

// ============================================
// BÚSQUEDA
// ============================================

function setupSearch() {
    var searchInput = document.getElementById('projectSearch');
    if (!searchInput) return;
    searchInput.addEventListener('input', function (e) {
        if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(function () {
            currentSearch = e.target.value.toLowerCase();
            renderProjects();
        }, PROJECTS_CONFIG.SEARCH_DEBOUNCE);
    });
}

// ============================================
// MODAL EVENTOS
// ============================================

function setupModalEvents() {
    var modal = document.getElementById('projectModal');
    var closeModal = function () {
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
    };
    var modalClose = document.getElementById('modalClose');
    if (modalClose) modalClose.addEventListener('click', closeModal);
    var modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    var modalPrev = document.getElementById('modalPrev');
    if (modalPrev) modalPrev.addEventListener('click', function () { navigateModal(-1); });
    var modalNext = document.getElementById('modalNext');
    if (modalNext) modalNext.addEventListener('click', function () { navigateModal(1); });
    document.addEventListener('keydown', function (e) {
        if (!modal || !modal.classList.contains('active')) return;
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') navigateModal(-1);
        if (e.key === 'ArrowRight') navigateModal(1);
    });
}

// ============================================
// IDIOMA
// ============================================

function setupLanguageListener() {
    document.addEventListener('languageChanged', function () {
        setupFilters();
        renderProjects();
        var searchInput = document.getElementById('projectSearch');
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
    }
    setupEventDelegation();
    setupSearch();
    setupModalEvents();
    setupLanguageListener();
}

window.renderProjects = renderProjects;
window.setupFilters = setupFilters;
initProjects();