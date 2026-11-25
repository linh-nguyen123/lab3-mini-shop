const CART_STORAGE_KEY = 'mini-shop-cart';

const products = [
  { id: 1, name: 'Wireless Headphones', price: 1290000, category: 'Electronics', image: '🎧' },
  { id: 2, name: 'Smart Watch', price: 2490000, category: 'Electronics', image: '⌚' },
  { id: 3, name: 'Bluetooth Speaker', price: 890000, category: 'Electronics', image: '🔊' },
  { id: 4, name: 'Denim Jacket', price: 750000, category: 'Fashion', image: '🧥' },
  { id: 5, name: 'Running Shoes', price: 1150000, category: 'Fashion', image: '👟' },
  { id: 6, name: 'Baseball Cap', price: 190000, category: 'Fashion', image: '🧢' },
  { id: 7, name: 'JavaScript Handbook', price: 320000, category: 'Books', image: '📘' },
  { id: 8, name: 'Web Design Sketchbook', price: 150000, category: 'Books', image: '📓' }
];

// Đọc giỏ hàng từ localStorage khi tải trang: mảng các { id, quantity }
let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
let activeCategory = 'All';
let searchQuery = '';

const productGrid = document.querySelector('#productGrid');
const filterButtons = document.querySelector('#filterButtons');
const searchInput = document.querySelector('#searchInput');
const cartCountEl = document.querySelector('#cartCount');
const cartTotalEl = document.querySelector('#cartTotal');
const clearCartBtn = document.querySelector('#clearCartBtn');

function formatVND(amount) {
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function getItemQuantity(productId) {
  const item = cart.find((c) => c.id === productId);
  return item ? item.quantity : 0;
}

// 1. Render các nút lọc danh mục
function renderFilters() {
  const categories = ['All', ...new Set(products.map((p) => p.category))];
  filterButtons.innerHTML = '';

  categories.forEach((cat) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `filter-btn ${cat === activeCategory ? 'active' : ''}`;
    btn.textContent = cat;
    btn.dataset.category = cat;
    filterButtons.appendChild(btn);
  });
}

// 2. Render danh sách sản phẩm theo bộ lọc & từ khóa tìm kiếm
function renderProducts() {
  const filtered = products.filter((p) => {
    const matchCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    productGrid.innerHTML = '<p class="empty-msg">No matching products found.</p>';
    return;
  }

  productGrid.innerHTML = filtered
    .map((p) => {
      const qty = getItemQuantity(p.id);
      const btnText = qty > 0 ? `Add to cart (${qty} in cart)` : 'Add to cart';

      return `
        <article class="product-card" data-id="${p.id}">
          <div class="product-image">${p.image}</div>
          <span class="product-category">${p.category}</span>
          <h2 class="product-name">${p.name}</h2>
          <p class="product-price">${formatVND(p.price)}</p>
          <button type="button" class="add-btn">${btnText}</button>
        </article>
      `;
    })
    .join('');
}

// 3. Cập nhật badge tổng số lượng và tổng tiền giỏ hàng
function renderCartSummary() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  cartCountEl.textContent = totalItems;
  cartTotalEl.textContent = formatVND(totalPrice);
}

// Event Delegation: chỉ gắn 1 listener duy nhất lên productGrid
productGrid.addEventListener('click', (e) => {
  if (!e.target.classList.contains('add-btn')) return;

  const card = e.target.closest('.product-card');
  if (!card) return;

  const productId = Number(card.dataset.id);
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveCart();
  renderCartSummary();
  renderProducts();
});

// Lọc theo danh mục
filterButtons.addEventListener('click', (e) => {
  if (!e.target.classList.contains('filter-btn')) return;
  activeCategory = e.target.dataset.category;
  renderFilters();
  renderProducts();
});

// Tìm kiếm theo từng phím gõ (Bonus)
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value.trim();
  renderProducts();
});

// Xóa toàn bộ giỏ hàng và xóa key trong localStorage
clearCartBtn.addEventListener('click', () => {
  cart = [];
  localStorage.removeItem(CART_STORAGE_KEY);
  renderCartSummary();
  renderProducts();
});

// Khởi chạy lần đầu
renderFilters();
renderProducts();
renderCartSummary();