// ========== KR4N30 PRODUCT VIEWER ==========

class ProductViewer {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentCategory = 'all';
        this.searchTerm = '';
        this.sortBy = 'default';
        this.itemsPerPage = 12;
        this.currentPage = 1;

        this.init();
    }

    async init() {
        await this.loadProducts();
        this.setupEventListeners();
        this.renderCategories();
        this.renderProducts();
    }

    async loadProducts() {
        try {
            const response = await fetch('products.json');
            if (!response.ok) throw new Error('Error loading products');
            this.products = await response.json();
            this.filteredProducts = [...this.products];
            this.updateStats();
        } catch (error) {
            console.error('Error:', error);
            this.showError('No se pudieron cargar los productos. Por favor, recarga la página.');
        }
    }

    setupEventListeners() {
        // Búsqueda
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        // Ordenamiento
        const sortSelect = document.getElementById('sortProducts');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.applyFilters();
            });
        }

        // Vista grid/list
        const gridViewBtn = document.getElementById('gridView');
        const listViewBtn = document.getElementById('listView');
        if (gridViewBtn && listViewBtn) {
            gridViewBtn.addEventListener('click', () => this.setView('grid'));
            listViewBtn.addEventListener('click', () => this.setView('list'));
        }

        // Modal
        const modal = document.getElementById('productModal');
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
        const categories = ['all', ...new Set(this.products.map(p => p.category))];
        const categoryContainer = document.getElementById('categoryFilters');
        if (!categoryContainer) return;

        categoryContainer.innerHTML = categories.map(cat => `
            <button class="category-btn ${this.currentCategory === cat ? 'active' : ''}" data-category="${cat}">
                ${cat === 'all' ? 'TODOS' : cat.toUpperCase()}
            </button>
        `).join('');

        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentCategory = btn.dataset.category;
                this.applyFilters();
                this.renderCategories();
            });
        });
    }

    applyFilters() {
        // Filtrar por categoría
        let filtered = this.currentCategory === 'all'
            ? [...this.products]
            : this.products.filter(p => p.category === this.currentCategory);

        // Filtrar por búsqueda
        if (this.searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(this.searchTerm) ||
                p.description.toLowerCase().includes(this.searchTerm) ||
                p.category.toLowerCase().includes(this.searchTerm)
            );
        }

        // Ordenar
        switch (this.sortBy) {
            case 'price-asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'rating':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            default:
                filtered.sort((a, b) => b.featured - a.featured);
        }

        this.filteredProducts = filtered;
        this.currentPage = 1;
        this.updateStats();
        this.renderProducts();
    }

    renderProducts() {
        const container = document.getElementById('productsContainer');
        if (!container) return;

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageProducts = this.filteredProducts.slice(start, end);

        if (pageProducts.length === 0) {
            container.innerHTML = `
                <div class="no-products">
                    <div class="no-products-icon">🔍</div>
                    <h3>No se encontraron productos</h3>
                    <p>Intenta con otros términos de búsqueda o categorías</p>
                </div>
            `;
            this.renderPagination();
            return;
        }

        const isGridView = !container.classList.contains('list-view');

        container.innerHTML = pageProducts.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                ${product.featured && isGridView ? '<div class="product-badge">✦ DESTACADO ✦</div>' : ''}
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300/1a0a2e/c084fc?text=KR4N30'">
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-title">${this.escapeHtml(product.name)}</h3>
                    <p class="product-description">${this.escapeHtml(product.description.substring(0, 80))}${product.description.length > 80 ? '...' : ''}</p>
                    <div class="product-rating">
                        ${this.renderStars(product.rating)}
                        <span class="rating-value">(${product.rating})</span>
                    </div>
                    <div class="product-footer">
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                        <div class="product-stock ${product.stock < 5 ? 'low-stock' : ''}">
                            ${product.stock > 0 ? `📦 ${product.stock} uds` : '❌ Sin stock'}
                        </div>
                    </div>
                    <button class="btn-view-product" data-product-id="${product.id}">
                        VER DETALLES ⟡
                    </button>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.btn-view-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(btn.dataset.productId);
                this.showProductDetails(productId);
            });
        });

        this.renderPagination();
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '★';
        }
        if (hasHalfStar) {
            stars += '½';
        }
        for (let i = stars.length; i < 5; i++) {
            stars += '☆';
        }

        return `<span class="stars">${stars}</span>`;
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
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

                this.renderProducts();
                const productosSection = document.getElementById('productos');
                if (productosSection) {
                    productosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    setView(view) {
        const container = document.getElementById('productsContainer');
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

        this.renderProducts();
    }

    showProductDetails(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const modal = document.getElementById('productModal');
        const modalContent = document.getElementById('modalContent');

        if (modal && modalContent) {
            modalContent.innerHTML = `
                <div class="modal-product">
                    <div class="modal-image">
                        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x300/1a0a2e/c084fc?text=KR4N30'">
                    </div>
                    <div class="modal-info">
                        <div class="modal-category">${product.category}</div>
                        <h2>${this.escapeHtml(product.name)}</h2>
                        <div class="modal-rating">
                            ${this.renderStars(product.rating)}
                            <span>(${product.rating})</span>
                        </div>
                        <div class="modal-price">$${product.price.toFixed(2)}</div>
                        <div class="modal-stock ${product.stock < 5 ? 'low-stock' : ''}">
                            ${product.stock > 0 ? `✓ Stock disponible: ${product.stock} unidades` : '✗ Producto agotado'}
                        </div>
                        <p class="modal-description">${this.escapeHtml(product.description)}</p>
                        <div class="modal-actions">
                            ${product.stock > 0 ? `
                                <div class="quantity-selector">
                                    <button class="qty-btn" id="qtyMinus">-</button>
                                    <input type="number" id="productQty" value="1" min="1" max="${product.stock}">
                                    <button class="qty-btn" id="qtyPlus">+</button>
                                </div>
                                <button class="btn-add-to-cart" data-product-id="${product.id}">
                                    ⟡ AÑADIR AL CARRITO ⟡
                                </button>
                            ` : '<button class="btn-disabled" disabled>❌ PRODUCTO AGOTADO</button>'}
                        </div>
                    </div>
                </div>
            `;

            modal.style.display = 'flex';

            if (product.stock > 0) {
                const qtyInput = document.getElementById('productQty');
                const minusBtn = document.getElementById('qtyMinus');
                const plusBtn = document.getElementById('qtyPlus');
                const addToCartBtn = modalContent.querySelector('.btn-add-to-cart');

                if (minusBtn && plusBtn && qtyInput) {
                    minusBtn.addEventListener('click', () => {
                        let val = parseInt(qtyInput.value);
                        if (val > 1) qtyInput.value = val - 1;
                    });

                    plusBtn.addEventListener('click', () => {
                        let val = parseInt(qtyInput.value);
                        if (val < product.stock) qtyInput.value = val + 1;
                    });
                }

                if (addToCartBtn) {
                    addToCartBtn.addEventListener('click', () => {
                        const quantity = parseInt(qtyInput?.value || 1);
                        this.addToCart(product, quantity);
                        modal.style.display = 'none';
                    });
                }
            }
        }
    }

    addToCart(product, quantity) {
        this.showNotification(`✓ ${quantity} x ${product.name} añadido al carrito`, 'success');
    }

    updateStats() {
        const statsElement = document.getElementById('productsStats');
        if (statsElement) {
            statsElement.textContent = `Mostrando ${this.filteredProducts.length} de ${this.products.length} productos`;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
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
        const container = document.getElementById('productsContainer');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <div class="error-icon">⚠️</div>
                    <h3>Error al cargar productos</h3>
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

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.productViewer = new ProductViewer();
});