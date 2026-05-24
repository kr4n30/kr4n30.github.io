// ========== KR4N30 PROJECT VIEWER MEJORADO ==========

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

            const controller =
                new AbortController();

            const timeout =
                setTimeout(
                    () => controller.abort(),
                    5000
                );

            const response =
                await fetch(
                    'assets/projects.json',
                    {
                        signal:
                            controller.signal
                    }
                );

            clearTimeout(
                timeout
            );

            if (!response.ok) {

                throw new Error(
                    'Error loading projects'
                );

            }

            const data =
                await response.json();

            this.projects =
                Array.isArray(data)
                    ? data
                    : [];

            this.filteredProjects =
                [...this.projects];

            this.updateStats();

        }

        catch (error) {

            console.error(
                error
            );

            this.showError(
                'No se pudieron cargar los proyectos'
            );

        }

    }

    setupEventListeners() {

        // ===================
        // búsqueda debounce
        // ===================

        const search =
            document.getElementById(
                'projectSearch'
            );

        let debounce;

        search?.addEventListener(
            'input',
            e => {

                clearTimeout(
                    debounce
                );

                debounce =
                    setTimeout(() => {

                        this.searchTerm =
                            e.target.value
                                .toLowerCase();

                        this.applyFilters();

                    }, 300);

            }
        );

        // ===================
        // categorías
        // ===================

        document
            .getElementById(
                'filterCategory'
            )
            ?.addEventListener(
                'change',
                e => {

                    this.currentCategory =
                        e.target.value;

                    this.applyFilters();

                });

        // ===================
        // botones vista
        // ===================

        document
            .getElementById(
                'gridView'
            )
            ?.addEventListener(
                'click',
                () => this.setView(
                    'grid'
                )
            );

        document
            .getElementById(
                'listView'
            )
            ?.addEventListener(
                'click',
                () => this.setView(
                    'list'
                )
            );

        // ===================
        // Delegación eventos
        // ===================

        document.addEventListener(
            'click',
            e => {

                const btn =
                    e.target.closest(
                        '.btn-view-project'
                    );

                if (btn) {

                    this.showProjectDetails(
                        Number(
                            btn.dataset
                                .projectId
                        )
                    );

                }

            }
        );

        // ===================
        // cerrar modal
        // ===================

        const modal =
            document.getElementById(
                'projectModal'
            );

        document
            .querySelector(
                '.modal-close'
            )
            ?.addEventListener(
                'click',
                () => {

                    modal.style.display =
                        'none';

                });

        modal?.addEventListener(
            'click',
            e => {

                if (
                    e.target === modal
                ) {

                    modal.style.display =
                        'none';

                }

            });

        // ESC

        document
            .addEventListener(
                'keydown',
                e => {

                    if (
                        e.key === "Escape"
                    ) {

                        modal.style.display =
                            'none';

                    }

                });

    }

    applyFilters() {

        let filtered =
            this.currentCategory === "all"

                ?

                [...this.projects]

                :

                this.projects.filter(
                    p =>

                        p.category ===
                        this.currentCategory
                );

        if (
            this.searchTerm
        ) {

            filtered =
                filtered.filter(
                    p => {

                        return [

                            p.title,
                            p.description,
                            p.category,
                            ...(p.tags || [])

                        ]

                            .join(' ')
                            .toLowerCase()

                            .includes(
                                this.searchTerm
                            );

                    });

        }

        filtered.sort(

            (a, b) =>

                new Date(
                    b.date
                )

                -

                new Date(
                    a.date
                )

        );

        this.filteredProjects =
            filtered;

        this.currentPage = 1;

        this.updateStats();

        this.renderProjects();

    }

    renderProjects() {

        const container =
            document.getElementById(
                'projectsContainer'
            );

        if (
            !container
        ) return;

        const start =

            (this.currentPage - 1)

            *

            this.itemsPerPage;

        const pageProjects =

            this.filteredProjects.slice(

                start,

                start +
                this.itemsPerPage

            );

        if (
            !pageProjects.length
        ) {

            container.innerHTML =
                `
            <div class="no-projects">

            <div class="no-projects-icon">
            🔍
            </div>

            <h3>
            No se encontraron proyectos
            </h3>

            </div>
            `;

            return;

        }

        container.innerHTML =

            pageProjects.map(
                p =>`

        <div
        class="project-card"
        >

        ${p.featured

                        ?

                        `<div class="project-badge">
        ✦ DESTACADO ✦
        </div>`

                        :

                        ''
                    }

        <div
        class="project-image"
        >

        <img
        src="${this.escapeHtml(
                        p.image
                    )
                    }"

        alt="${this.escapeHtml(
                        p.title
                    )
                    }"

        loading="lazy"
        >

        </div>

        <div
        class="project-info"
        >

        <div
        class="project-category"
        >

        ${this.escapeHtml(
                        p.category
                    )
                    }

        </div>

        <h3>

        ${this.escapeHtml(
                        p.title
                    )
                    }

        </h3>

        <p>

        ${this.escapeHtml(
                        p.description
                            .substring(
                                0,
                                100
                            )
                    )
                    }

        </p>

        <button

        class=
        "btn-view-project"

        data-project-id=
        "${p.id
                    }"

        >

        VER PROYECTO ⟡

        </button>

        </div>

        </div>

        `
            )
                .join('');

        this.renderPagination();

    }

    showProjectDetails(id) {

        const project =

            this.projects.find(

                p => p.id === id

            );

        if (
            !project
        ) return;

        const modal =
            document.getElementById(
                'projectModal'
            );

        const content =
            document.getElementById(
                'modalContent'
            );

        const safeLink =

            project.link

                &&

                /^https?:\/\//i
                    .test(
                        project.link
                    )

                ?

                project.link

                :

                null;

        content.innerHTML =
            `

        <h2>
        ${this.escapeHtml(
                project.title
            )
            }
        </h2>

        <p>
        ${this.escapeHtml(
                project.description
            )
            }
        </p>

        ${safeLink

                ?

                `<a
        href="${safeLink}"
        target="_blank"
        rel="noopener noreferrer"
        class="btn-kr4n30">

        VISITAR

        </a>`

                :

                ''

            }

        `;

        modal.style.display =
            'flex';

    }

    updateStats() {

        document
            .getElementById(
                'projectsStats'
            )
            ?.textContent =

            `Mostrando
        ${this.filteredProjects.length}
        de
        ${this.projects.length}
        proyectos`;

    }

    escapeHtml(text = '') {

        const div =
            document.createElement(
                'div'
            );

        div.textContent =
            text;

        return div.innerHTML;

    }

}

document.addEventListener(
    'DOMContentLoaded',
    () => {

        window.projectViewer =
            new ProjectViewer();

    });