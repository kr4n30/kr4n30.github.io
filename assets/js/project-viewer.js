// ========== KR4N30 PROJECT VIEWER - CON RUTA A ASSETS ==========

class ProjectViewer {
    constructor() {
        this.projects = [];
        this.filteredProjects = [];
        this.currentCategory = 'all';
        this.searchTerm = '';
        this.itemsPerPage = 9;
        this.currentPage = 1;

        this.init();
    }

    async init() {
        await this.loadProjects();
        this.setupEventListeners();
        this.renderCategories();
        this.renderProjects();
    }

    async loadProjects() {
        try {
            // Ruta corregida: busca projects.json en la carpeta assets
            const response = await fetch('assets/projects.json');
            if (!response.ok) throw new Error('Error loading projects');
            this.projects = await response.json();
            this.filteredProjects = [...this.projects];
            this.updateStats();
        } catch (error) {
            console.error('Error:', error);
            this.showError('No se pudieron cargar los proyectos. Asegúrate de que el archivo assets/projects.json existe.');
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('projectSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        const categoryFilter = document.getElementById('filterCategory');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentCategory = e.target.value;
                this.applyFilters();
            });
        }

        const gridViewBtn = document.getElementById('gridView');
        const listViewBtn = document.getElementById('listView');
        if (gridViewBtn && listViewBtn) {
            gridViewBtn.addEventListener('click', () => this.setView('grid'));
            listViewBtn.addEventListener('click', () => this.setView('list'));
        }

        const modal = document.getElementById('projectModal');
        const closeBtn = document.querySelector('.modal-close');
        if (modal && closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });

            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    }

    renderCategories() {
        const categories = ['all', ...new Set(this.projects.map(p => p.category))];
        const categoryFilter = document.getElementById('filterCategory');
        if (!categoryFilter) return;

        categoryFilter.innerHTML = categories.map(cat => `
            <option value="${cat}" ${this.currentCategory === cat ? 'selected' : ''}>
                ${cat === 'all' ? 'Todas las categorías ▼' : cat.toUpperCase()}
            </option>
        `).join('');
    }

    applyFilters() {
        let filtered = this.currentCategory === 'all'
            ? [...this.projects]
            : this.projects.filter(p => p.category === this.currentCategory);

        if (this.searchTerm) {
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(this.searchTerm) ||
                p.description.toLowerCase().includes(this.searchTerm) ||
                p.category.toLowerCase().includes(this.searchTerm) ||
                p.tags.some(tag => tag.toLowerCase().includes(this.searchTerm))
            );
        }

        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        this.filteredProjects = filtered;
        this.currentPage = 1;
        this.updateStats();
        this.renderProjects();
    }

    renderProjects() {
        const container = document.getElementById('projectsContainer');
        if (!container) return;

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageProjects = this.filteredProjects.slice(start, end);

        if (pageProjects.length === 0) {
            container.innerHTML = `
                <div class="no-projects">
                    <div class="no-projects-icon">🔍</div>
                    <h3>No se encontraron proyectos</h3>
                    <p>Intenta con otros términos de búsqueda o categorías</p>
                </div>
            `;
            this.renderPagination();
            return;
        }

        const isGridView = !container.classList.contains('list-view');

        container.innerHTML = pageProjects.map(project => `
            <div class="project-card" data-project-id="${project.id}">
                ${project.featured ? '<div class="project-badge">✦ DESTACADO ✦</div>' : ''}
                <div class="project-image">
                    <img src="${project.image}" alt="${project.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x250/1a0a2e/c084fc?text=KR4N30'">
                </div>
                <div class="project-info">
                    <div class="project-category">${project.category}</div>
                    <h3 class="project-title">${this.escapeHtml(project.title)}</h3>
                    <p class="project-description">${this.escapeHtml(project.description.substring(0, 100))}${project.description.length > 100 ? '...' : ''}</p>
                    <div class="project-tech">
                        ${project.tags.slice(0, 3).map(tag => `<span class="tech-tag">${this.escapeHtml(tag)}</span>`).join('')}
                        ${project.tags.length > 3 ? `<span class="tech-tag">+${project.tags.length - 3}</span>` : ''}
                    </div>
                    <div class="project-footer">
                        <div class="project-year">${new Date(project.date).getFullYear()}</div>
                        <button class="btn-view-project" data-project-id="${project.id}">
                            VER PROYECTO ⟡
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.btn-view-project').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const projectId = parseInt(btn.dataset.projectId);
                this.showProjectDetails(projectId);
            });
        });

        this.renderPagination();
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredProjects.length / this.itemsPerPage);
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer || totalPages <= 1) {
            if (paginationContainer) paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="pagination-controls">';

        paginationHTML += `
            <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} data-page="prev">
                ◀ ANTERIOR
            </button>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button class="pagination-number ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<span class="pagination-dots">...</span>';
            }
        }

        paginationHTML += `
            <button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} data-page="next">
                SIGUIENTE ▶
            </button>
        `;

        paginationHTML += '</div>';
        paginationContainer.innerHTML = paginationHTML;

        document.querySelectorAll('.pagination-btn, .pagination-number').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.disabled) return;

                const page = btn.dataset.page;
                if (page === 'prev' && this.currentPage > 1) {
                    this.currentPage--;
                } else if (page === 'next' && this.currentPage < totalPages) {
                    this.currentPage++;
                } else if (!isNaN(parseInt(page))) {
                    this.currentPage = parseInt(page);
                }

                this.renderProjects();
                const proyectosSection = document.getElementById('proyectos');
                if (proyectosSection) {
                    proyectosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    setView(view) {
        const container = document.getElementById('projectsContainer');
        const gridBtn = document.getElementById('gridView');
        const listBtn = document.getElementById('listView');

        if (view === 'grid') {
            container.classList.remove('list-view');
            container.classList.add('grid-view');
            if (gridBtn && listBtn) {
                gridBtn.classList.add('active');
                listBtn.classList.remove('active');
            }
        } else {
            container.classList.remove('grid-view');
            container.classList.add('list-view');
            if (gridBtn && listBtn) {
                listBtn.classList.add('active');
                gridBtn.classList.remove('active');
            }
        }

        this.renderProjects();
    }

    showProjectDetails(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        const modal = document.getElementById('projectModal');
        const modalContent = document.getElementById('modalContent');

        if (modal && modalContent) {
            modalContent.innerHTML = `
                <div class="modal-project">
                    <div class="modal-image">
                        <img src="${project.image}" alt="${project.title}" onerror="this.src='https://via.placeholder.com/500x400/1a0a2e/c084fc?text=KR4N30'">
                    </div>
                    <div class="modal-info">
                        <div class="modal-category">${project.category}</div>
                        <h2>${this.escapeHtml(project.title)}</h2>
                        <div class="modal-year">📅 ${new Date(project.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}</div>
                        <p class="modal-description">${this.escapeHtml(project.description)}</p>
                        <div class="modal-tech">
                            <h4>Tecnologías utilizadas:</h4>
                            <div class="tech-list">
                                ${project.tags.map(tag => `<span class="tech-tag">${this.escapeHtml(tag)}</span>`).join('')}
                            </div>
                        </div>
                        ${project.features ? `
                            <div class="modal-features">
                                <h4>Características principales:</h4>
                                <ul>
                                    ${project.features.map(feature => `<li>${this.escapeHtml(feature)}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        ${project.link ? `
                            <a href="${project.link}" target="_blank" class="btn-kr4n30 modal-link">⟡ VISITAR PROYECTO ⟡</a>
                        ` : ''}
                    </div>
                </div>
            `;

            modal.style.display = 'flex';
        }
    }

    updateStats() {
        const statsElement = document.getElementById('projectsStats');
        if (statsElement) {
            statsElement.textContent = `Mostrando ${this.filteredProjects.length} de ${this.projects.length} proyectos`;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#a855f7'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            font-family: monospace;
            font-weight: bold;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    showError(message) {
        const container = document.getElementById('projectsContainer');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <div class="error-icon">⚠️</div>
                    <h3>Error al cargar proyectos</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="btn-kr4n30">⟡ RECARGAR ⟡</button>
                </div>
            `;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    window.projectViewer = new ProjectViewer();
});