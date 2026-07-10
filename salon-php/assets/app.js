const state = {
  products: [],
  orders: [],
  cart: new Map(),
};

const $ = (selector) => document.querySelector(selector);
const api = (action, params = {}) => {
  const query = new URLSearchParams({ action, ...params });
  return `api.php?${query.toString()}`;
};
const money = (value) => `$ ${Number(value || 0).toLocaleString('es-AR')}`;

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Error de servidor');
  return data;
}

function toast(message) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.add('visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove('visible'), 2800);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function stockClass(stock) {
  if (stock <= 0) return 'stock empty';
  if (stock <= 5) return 'stock low';
  return 'stock ok';
}

async function loadHealth() {
  try {
    await request(api('health'));
    $('#serviceStatus').textContent = 'PHP activo';
    $('#serviceStatus').className = 'status ok';
  } catch {
    $('#serviceStatus').textContent = 'Sin conexión';
    $('#serviceStatus').className = 'status error';
  }
}

async function loadProducts() {
  const data = await request(api('products'));
  state.products = data.products || [];
  renderOrderProducts();
  renderProductsTable();
  renderCart();
}

async function loadOrders() {
  const data = await request(api('orders'));
  state.orders = data.orders || [];
  renderHistory();
}

async function setView(view) {
  document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.view === view));
  document.querySelectorAll('.view').forEach((section) => section.classList.toggle('active', section.id === `view-${view}`));
  if (view === 'history') await loadOrders();
  if (view === 'products' || view === 'order') await loadProducts();
}

function renderOrderProducts() {
  const search = $('#productSearch').value.trim().toLowerCase();
  const products = state.products.filter((product) => {
    if (product.active === false) return false;
    return `${product.name} ${product.category}`.toLowerCase().includes(search);
  });

  $('#orderProducts').innerHTML = products.length ? products.map((product) => `
    <button type="button" class="product-card" data-add="${product.id}" ${Number(product.stock || 0) <= 0 ? 'disabled' : ''}>
      <strong>${escapeHtml(product.name)}</strong>
      <span>${escapeHtml(product.category || 'General')}</span>
      <b>${money(product.price)}</b>
      <em class="${stockClass(Number(product.stock || 0))}">Stock ${Number(product.stock || 0)}</em>
    </button>
  `).join('') : '<div class="empty">Sin productos disponibles.</div>';
}

function renderCart() {
  const items = [...state.cart.values()];
  if (!items.length) {
    $('#cartList').innerHTML = '<div class="empty">Sin productos en la comanda.</div>';
    $('#orderTotal').textContent = money(0);
    return;
  }

  $('#cartList').innerHTML = items.map((item) => `
    <article class="cart-item">
      <div>
        <strong>${escapeHtml(item.product.name)}</strong>
        <span>${money(item.product.price)} c/u</span>
      </div>
      <div class="qty">
        <button type="button" data-dec="${item.product.id}">-</button>
        <b>${item.quantity}</b>
        <button type="button" data-inc="${item.product.id}">+</button>
      </div>
      <input type="text" placeholder="Nota del producto" value="${escapeHtml(item.notes || '')}" data-note="${item.product.id}">
    </article>
  `).join('');

  const total = items.reduce((sum, item) => sum + Number(item.product.price || 0) * item.quantity, 0);
  $('#orderTotal').textContent = money(total);
}

function renderProductsTable() {
  $('#productsTable').innerHTML = state.products.length ? state.products.map((product) => `
    <tr>
      <td><strong>${escapeHtml(product.name)}</strong></td>
      <td>${escapeHtml(product.category || 'General')}</td>
      <td>${money(product.price)}</td>
      <td><span class="${stockClass(Number(product.stock || 0))}">${Number(product.stock || 0)}</span></td>
      <td>${product.active === false ? 'Inactivo' : 'Activo'}</td>
      <td class="row-actions">
        <button type="button" class="secondary small" data-edit="${product.id}">Editar</button>
        <button type="button" class="danger small" data-delete="${product.id}">Borrar</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="6">Sin productos cargados.</td></tr>';
}

function renderHistory() {
  $('#historyList').innerHTML = state.orders.length ? state.orders.map((order) => {
    const destination = order.tableNumber ? `Mesa ${order.tableNumber}` : (order.customerName || 'Nombre sin cargar');
    const statusClass = order.printStatus === 'error' ? 'badge error' : 'badge';
    const status = order.printStatus === 'error' ? 'Error impresión' : 'Impresa';
    return `
      <article class="history-card">
        <header>
          <div>
            <strong>${escapeHtml(destination)}</strong>
            <span>${new Date(order.createdAt).toLocaleString('es-AR')} - ${money(order.total)}</span>
          </div>
          <em class="${statusClass}">${status}</em>
        </header>
        <ul>${(order.items || []).map((item) => `<li>${item.quantity} x ${escapeHtml(item.productName)}</li>`).join('')}</ul>
        ${order.notes ? `<p>${escapeHtml(order.notes)}</p>` : ''}
        ${order.printError ? `<p>${escapeHtml(order.printError)}</p>` : ''}
        <footer>
          <button type="button" class="secondary" data-preview="${order.id}">Preview</button>
          <button type="button" class="primary" data-reprint="${order.id}">Reimprimir</button>
        </footer>
      </article>
    `;
  }).join('') : '<div class="empty">Sin comandas emitidas.</div>';
}

function addToCart(id) {
  const product = state.products.find((item) => item.id === id);
  if (!product) return;
  const current = state.cart.get(id);
  const quantity = current ? current.quantity + 1 : 1;
  if (quantity > Number(product.stock || 0)) {
    toast('No hay más stock disponible.');
    return;
  }
  state.cart.set(id, { product, quantity, notes: current?.notes || '' });
  renderCart();
}

function changeQty(id, delta) {
  const item = state.cart.get(id);
  if (!item) return;
  const quantity = item.quantity + delta;
  if (quantity <= 0) state.cart.delete(id);
  else if (quantity <= Number(item.product.stock || 0)) state.cart.set(id, { ...item, quantity });
  else toast('No hay más stock disponible.');
  renderCart();
}

function destinationMode() {
  return document.querySelector('input[name="destinationMode"]:checked')?.value || 'table';
}

function syncDestinationFields() {
  const byTable = destinationMode() === 'table';
  $('#tableField').classList.toggle('hidden', !byTable);
  $('#nameField').classList.toggle('hidden', byTable);
  if (byTable) $('#customerName').value = '';
  else $('#tableNumber').value = '';
}

function clearOrder() {
  state.cart.clear();
  $('#tableNumber').value = '';
  $('#customerName').value = '';
  $('#orderNotes').value = '';
  renderCart();
}

async function submitOrder() {
  const button = $('#submitOrder');
  const items = [...state.cart.values()].map((item) => ({
    productId: item.product.id,
    quantity: item.quantity,
    notes: item.notes || '',
  }));

  if (!items.length) {
    toast('Agregá productos a la comanda.');
    return;
  }

  if (destinationMode() === 'table' && !$('#tableNumber').value.trim()) {
    toast('Elegí el número de mesa.');
    return;
  }

  if (destinationMode() === 'name' && !$('#customerName').value.trim()) {
    toast('Poné el nombre.');
    return;
  }

  button.disabled = true;
  try {
    const data = await request(api('orders'), {
      method: 'POST',
      body: JSON.stringify({
        tableNumber: $('#tableNumber').value,
        customerName: $('#customerName').value,
        notes: $('#orderNotes').value,
        items,
      }),
    });
    clearOrder();
    await loadProducts();
    toast(data.printOk ? 'Comanda emitida.' : 'Comanda guardada, revisar impresora.');
  } catch (error) {
    toast(error.message);
  } finally {
    button.disabled = false;
  }
}

function resetProductForm() {
  $('#productId').value = '';
  $('#productName').value = '';
  $('#productCategory').value = 'General';
  $('#productPrice').value = '0';
  $('#productStock').value = '0';
  $('#productActive').checked = true;
}

function editProduct(id) {
  const product = state.products.find((item) => item.id === id);
  if (!product) return;
  $('#productId').value = product.id;
  $('#productName').value = product.name;
  $('#productCategory').value = product.category || 'General';
  $('#productPrice').value = product.price || 0;
  $('#productStock').value = product.stock || 0;
  $('#productActive').checked = product.active !== false;
  setView('products');
  $('#productName').focus();
}

async function saveProduct(event) {
  event.preventDefault();
  const id = $('#productId').value;
  const payload = {
    name: $('#productName').value,
    category: $('#productCategory').value,
    price: Number($('#productPrice').value || 0),
    stock: Number($('#productStock').value || 0),
    active: $('#productActive').checked,
  };

  await request(api(id ? 'product' : 'products', id ? { id } : {}), {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(payload),
  });
  resetProductForm();
  await loadProducts();
  toast('Producto guardado.');
}

async function deleteProduct(id) {
  const product = state.products.find((item) => item.id === id);
  if (!product || !confirm(`Borrar ${product.name}?`)) return;
  await request(api('product', { id }), { method: 'DELETE' });
  await loadProducts();
  toast('Producto borrado.');
}

async function previewOrder(id) {
  const data = await request(api('preview', { id }));
  const preview = window.open('', '_blank', 'width=420,height=680');
  preview.document.write(`<pre style="font:16px monospace;white-space:pre-wrap">${escapeHtml(data.preview)}</pre>`);
  preview.document.close();
}

async function reprintOrder(id) {
  const data = await request(api('reprint', { id }), { method: 'POST' });
  await loadOrders();
  toast(data.printOk ? 'Comanda enviada.' : 'No se pudo imprimir.');
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.view) setView(button.dataset.view).catch((error) => toast(error.message));
  if (button.dataset.add) addToCart(button.dataset.add);
  if (button.dataset.inc) changeQty(button.dataset.inc, 1);
  if (button.dataset.dec) changeQty(button.dataset.dec, -1);
  if (button.dataset.edit) editProduct(button.dataset.edit);
  if (button.dataset.delete) deleteProduct(button.dataset.delete).catch((error) => toast(error.message));
  if (button.dataset.preview) previewOrder(button.dataset.preview).catch((error) => toast(error.message));
  if (button.dataset.reprint) reprintOrder(button.dataset.reprint).catch((error) => toast(error.message));
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'productSearch') renderOrderProducts();
  if (event.target.dataset.note) {
    const item = state.cart.get(event.target.dataset.note);
    if (item) state.cart.set(event.target.dataset.note, { ...item, notes: event.target.value });
  }
});

document.querySelectorAll('input[name="destinationMode"]').forEach((input) => {
  input.addEventListener('change', syncDestinationFields);
});

$('#productForm').addEventListener('submit', (event) => saveProduct(event).catch((error) => toast(error.message)));
$('#cancelEdit').addEventListener('click', resetProductForm);
$('#reloadProducts').addEventListener('click', () => loadProducts().catch((error) => toast(error.message)));
$('#reloadOrderProducts').addEventListener('click', () => loadProducts().catch((error) => toast(error.message)));
$('#reloadHistory').addEventListener('click', () => loadOrders().catch((error) => toast(error.message)));
$('#clearOrder').addEventListener('click', clearOrder);
$('#submitOrder').addEventListener('click', submitOrder);

syncDestinationFields();
loadHealth();
loadProducts().catch((error) => toast(error.message));
