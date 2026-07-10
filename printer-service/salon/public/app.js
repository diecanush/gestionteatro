const state = {
  products: [],
  orders: [],
  cart: new Map(),
  currentView: 'order',
};

const $ = (selector) => document.querySelector(selector);
const api = (path) => `/salon/api${path}`;
const money = (value) => `$ ${Number(value || 0).toLocaleString('es-AR')}`;

const toast = (message) => {
  const element = $('#toast');
  element.textContent = message;
  element.classList.add('is-visible');
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => element.classList.remove('is-visible'), 2800);
};

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(data?.error || data || 'Error de servidor');
  }

  return data;
};

const stockClass = (stock) => {
  if (stock <= 0) return 'stock-empty';
  if (stock <= 5) return 'stock-low';
  return 'stock-ok';
};

const setServiceStatus = async () => {
  const dot = $('#serviceDot');
  const label = $('#serviceStatus');

  try {
    await request('/health');
    dot.className = 'dot is-ok';
    label.textContent = 'Servicio activo';
  } catch {
    dot.className = 'dot is-error';
    label.textContent = 'Sin conexion';
  }
};

const loadProducts = async () => {
  const data = await request(api('/products'));
  state.products = data.products || [];
  renderProductsTable();
  renderOrderProducts();
  renderCart();
};

const loadOrders = async () => {
  const data = await request(api('/orders'));
  state.orders = data.orders || [];
  renderHistory();
};

const setView = async (view) => {
  state.currentView = view;
  document.querySelectorAll('.tab').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.view === view);
  });
  document.querySelectorAll('.view').forEach((section) => {
    section.classList.toggle('is-active', section.id === `view-${view}`);
  });

  if (view === 'history') await loadOrders();
  if (view === 'products' || view === 'order') await loadProducts();
};

const renderOrderProducts = () => {
  const container = $('#orderProductList');
  const search = $('#productSearch').value.trim().toLowerCase();
  const products = state.products.filter((product) => {
    if (product.active === false) return false;
    const text = `${product.name} ${product.category}`.toLowerCase();
    return !search || text.includes(search);
  });

  if (products.length === 0) {
    container.innerHTML = '<div class="empty-state">Sin productos disponibles.</div>';
    return;
  }

  container.innerHTML = products.map((product) => `
    <button class="product-card" type="button" data-add-product="${product.id}" ${product.stock <= 0 ? 'disabled' : ''}>
      <strong>${escapeHtml(product.name)}</strong>
      <span class="product-meta">${escapeHtml(product.category || 'General')}</span>
      <span>${money(product.price)}</span>
      <span class="${stockClass(Number(product.stock || 0))}">Stock ${Number(product.stock || 0)}</span>
    </button>
  `).join('');
};

const renderCart = () => {
  const container = $('#cartList');
  const items = [...state.cart.values()];

  if (items.length === 0) {
    container.innerHTML = '<div class="cart-empty">Todavia no hay productos.</div>';
    $('#orderTotal').textContent = money(0);
    return;
  }

  container.innerHTML = items.map((item) => `
    <div class="cart-item">
      <div class="cart-row">
        <div>
          <strong>${escapeHtml(item.product.name)}</strong>
          <div class="cart-meta">${money(item.product.price)} c/u</div>
        </div>
        <div class="qty-control">
          <button type="button" data-dec="${item.product.id}">-</button>
          <span>${item.quantity}</span>
          <button type="button" data-inc="${item.product.id}">+</button>
        </div>
      </div>
      <input type="text" value="${escapeAttr(item.notes || '')}" placeholder="Nota" data-note="${item.product.id}" />
    </div>
  `).join('');

  const total = items.reduce((sum, item) => sum + Number(item.product.price || 0) * item.quantity, 0);
  $('#orderTotal').textContent = money(total);
};

const renderProductsTable = () => {
  const table = $('#productsTable');

  if (state.products.length === 0) {
    table.innerHTML = '<tr><td colspan="6">Sin productos cargados.</td></tr>';
    return;
  }

  table.innerHTML = state.products.map((product) => `
    <tr>
      <td><strong>${escapeHtml(product.name)}</strong></td>
      <td>${escapeHtml(product.category || 'General')}</td>
      <td>${money(product.price)}</td>
      <td><span class="${stockClass(Number(product.stock || 0))}">${Number(product.stock || 0)}</span></td>
      <td>${product.active === false ? 'Inactivo' : 'Activo'}</td>
      <td>
        <div class="row-actions">
          <button class="secondary" type="button" data-edit="${product.id}">Editar</button>
          <button class="danger" type="button" data-delete="${product.id}">Borrar</button>
        </div>
      </td>
    </tr>
  `).join('');
};

const renderHistory = () => {
  const container = $('#historyList');

  if (state.orders.length === 0) {
    container.innerHTML = '<div class="empty-state">Sin comandas emitidas.</div>';
    return;
  }

  container.innerHTML = state.orders.map((order) => {
    const title = order.tableNumber ? `Mesa ${order.tableNumber}` : (order.customerName || 'Barra');
    const date = new Date(order.createdAt).toLocaleString('es-AR');
    const statusClass = order.printStatus === 'error' ? 'badge error' : 'badge';
    const statusText = order.printStatus === 'error' ? 'Error impresion' : 'Impresa';
    return `
      <article class="history-card">
        <div class="history-top">
          <div>
            <strong>${escapeHtml(title)}</strong>
            <div class="history-meta">${date} - ${money(order.total)}</div>
          </div>
          <span class="${statusClass}">${statusText}</span>
        </div>
        <ul class="history-items">
          ${(order.items || []).map((item) => `<li>${item.quantity} x ${escapeHtml(item.productName)}</li>`).join('')}
        </ul>
        ${order.notes ? `<div class="history-meta">Nota: ${escapeHtml(order.notes)}</div>` : ''}
        ${order.printError ? `<div class="history-meta">Impresora: ${escapeHtml(order.printError)}</div>` : ''}
        <div class="history-actions">
          <button class="secondary" type="button" data-preview="${order.id}">Preview</button>
          <button class="primary" type="button" data-reprint="${order.id}">Reimprimir</button>
        </div>
      </article>
    `;
  }).join('');
};

const addProductToCart = (productId) => {
  const product = state.products.find((item) => item.id === productId);
  if (!product || product.stock <= 0) return;

  const existing = state.cart.get(productId);
  const nextQuantity = existing ? existing.quantity + 1 : 1;

  if (nextQuantity > product.stock) {
    toast('No hay mas stock disponible.');
    return;
  }

  state.cart.set(productId, { product, quantity: nextQuantity, notes: existing?.notes || '' });
  renderCart();
};

const updateQuantity = (productId, delta) => {
  const item = state.cart.get(productId);
  if (!item) return;
  const nextQuantity = item.quantity + delta;

  if (nextQuantity <= 0) {
    state.cart.delete(productId);
  } else if (nextQuantity <= Number(item.product.stock || 0)) {
    state.cart.set(productId, { ...item, quantity: nextQuantity });
  } else {
    toast('No hay mas stock disponible.');
  }

  renderCart();
};

const clearOrder = () => {
  state.cart.clear();
  $('#tableNumber').value = '';
  $('#customerName').value = '';
  $('#orderNotes').value = '';
  renderCart();
};

const submitOrder = async () => {
  const button = $('#submitOrder');
  const items = [...state.cart.values()].map((item) => ({
    productId: item.product.id,
    quantity: item.quantity,
    notes: item.notes || '',
  }));

  if (items.length === 0) {
    toast('Agrega productos a la comanda.');
    return;
  }

  button.disabled = true;
  try {
    const data = await request(api('/orders'), {
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
};

const resetProductForm = () => {
  $('#productId').value = '';
  $('#productName').value = '';
  $('#productCategory').value = 'General';
  $('#productPrice').value = '0';
  $('#productStock').value = '0';
  $('#productActive').checked = true;
};

const editProduct = (productId) => {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;
  $('#productId').value = product.id;
  $('#productName').value = product.name;
  $('#productCategory').value = product.category || 'General';
  $('#productPrice').value = product.price || 0;
  $('#productStock').value = product.stock || 0;
  $('#productActive').checked = product.active !== false;
  $('#productName').focus();
};

const saveProduct = async (event) => {
  event.preventDefault();
  const id = $('#productId').value;
  const payload = {
    name: $('#productName').value,
    category: $('#productCategory').value,
    price: Number($('#productPrice').value || 0),
    stock: Number($('#productStock').value || 0),
    active: $('#productActive').checked,
  };

  try {
    await request(api(id ? `/products/${id}` : '/products'), {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    });
    resetProductForm();
    await loadProducts();
    toast('Producto guardado.');
  } catch (error) {
    toast(error.message);
  }
};

const deleteProduct = async (productId) => {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;
  if (!window.confirm(`Borrar ${product.name}?`)) return;

  try {
    await request(api(`/products/${productId}`), { method: 'DELETE' });
    await loadProducts();
    toast('Producto borrado.');
  } catch (error) {
    toast(error.message);
  }
};

const previewOrder = async (orderId) => {
  try {
    const text = await request(api(`/orders/${orderId}/preview`));
    const preview = window.open('', '_blank', 'width=420,height=680');
    preview.document.write(`<pre style="font: 16px monospace; white-space: pre-wrap;">${escapeHtml(text)}</pre>`);
    preview.document.close();
  } catch (error) {
    toast(error.message);
  }
};

const reprintOrder = async (orderId) => {
  try {
    await request(api(`/orders/${orderId}/reprint`), { method: 'POST' });
    await loadOrders();
    toast('Comanda enviada a impresora.');
  } catch (error) {
    toast(error.message);
  }
};

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const escapeAttr = escapeHtml;

document.addEventListener('click', async (event) => {
  const target = event.target.closest('button');
  if (!target) return;

  if (target.dataset.view) setView(target.dataset.view);
  if (target.dataset.addProduct) addProductToCart(target.dataset.addProduct);
  if (target.dataset.inc) updateQuantity(target.dataset.inc, 1);
  if (target.dataset.dec) updateQuantity(target.dataset.dec, -1);
  if (target.dataset.edit) editProduct(target.dataset.edit);
  if (target.dataset.delete) deleteProduct(target.dataset.delete);
  if (target.dataset.preview) previewOrder(target.dataset.preview);
  if (target.dataset.reprint) reprintOrder(target.dataset.reprint);
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'productSearch') renderOrderProducts();
  if (event.target.dataset.note) {
    const item = state.cart.get(event.target.dataset.note);
    if (item) state.cart.set(event.target.dataset.note, { ...item, notes: event.target.value });
  }
});

$('#productForm').addEventListener('submit', saveProduct);
$('#cancelEdit').addEventListener('click', resetProductForm);
$('#reloadProducts').addEventListener('click', loadProducts);
$('#reloadOrderProducts').addEventListener('click', loadProducts);
$('#reloadHistory').addEventListener('click', loadOrders);
$('#clearOrder').addEventListener('click', clearOrder);
$('#submitOrder').addEventListener('click', submitOrder);

setServiceStatus();
loadProducts().catch((error) => toast(error.message));
