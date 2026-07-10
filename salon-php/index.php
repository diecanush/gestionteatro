<?php

declare(strict_types=1);

?><!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Salon - Comandas</title>
    <link rel="stylesheet" href="assets/styles.css">
  </head>
  <body>
    <header class="topbar">
      <div>
        <p>SALON</p>
        <h1>Comandas</h1>
      </div>
      <span id="serviceStatus" class="status">Conectando</span>
    </header>

    <nav class="tabs" aria-label="Secciones">
      <button type="button" class="tab active" data-view="order">Comanda</button>
      <button type="button" class="tab" data-view="products">Productos</button>
      <button type="button" class="tab" data-view="history">Historial</button>
    </nav>

    <main>
      <section id="view-order" class="view active">
        <div class="section-title">
          <div>
            <p>Stock propio</p>
            <h2>Nueva comanda</h2>
          </div>
          <button type="button" class="secondary" id="reloadOrderProducts">Actualizar</button>
        </div>

        <div class="order-grid">
          <section class="panel">
            <div class="panel-head">
              <h3>Productos</h3>
              <input id="productSearch" type="search" placeholder="Buscar">
            </div>
            <div id="orderProducts" class="product-grid"></div>
          </section>

          <section class="panel ticket">
            <div class="panel-head">
              <h3>Destino</h3>
              <button type="button" class="ghost" id="clearOrder">Limpiar</button>
            </div>

            <div class="segmented">
              <label>
                <input type="radio" name="destinationMode" value="table" checked>
                Mesa
              </label>
              <label>
                <input type="radio" name="destinationMode" value="name">
                Nombre
              </label>
            </div>

            <label id="tableField">
              Número de mesa
              <input id="tableNumber" type="number" min="1" inputmode="numeric">
            </label>

            <label id="nameField" class="hidden">
              Nombre
              <input id="customerName" type="text" autocomplete="off">
            </label>

            <div id="cartList" class="cart-list"></div>

            <label>
              Nota general
              <textarea id="orderNotes" rows="3"></textarea>
            </label>

            <footer class="ticket-footer">
              <strong id="orderTotal">$ 0</strong>
              <button type="button" class="primary" id="submitOrder">Emitir</button>
            </footer>
          </section>
        </div>
      </section>

      <section id="view-products" class="view">
        <div class="section-title">
          <div>
            <p>Archivo JSON local</p>
            <h2>Productos</h2>
          </div>
          <button type="button" class="secondary" id="reloadProducts">Actualizar</button>
        </div>

        <div class="management-grid">
          <form id="productForm" class="panel form-panel">
            <input id="productId" type="hidden">
            <label>
              Nombre
              <input id="productName" type="text" required>
            </label>
            <label>
              Categoría
              <input id="productCategory" type="text" value="General">
            </label>
            <div class="field-grid">
              <label>
                Precio
                <input id="productPrice" type="number" min="0" step="0.01" value="0">
              </label>
              <label>
                Stock
                <input id="productStock" type="number" min="0" step="1" value="0">
              </label>
            </div>
            <label class="checkline">
              <input id="productActive" type="checkbox" checked>
              Activo
            </label>
            <div class="actions">
              <button type="button" class="secondary" id="cancelEdit">Cancelar</button>
              <button type="submit" class="primary">Guardar</button>
            </div>
          </form>

          <section class="panel table-panel">
            <div class="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="productsTable"></tbody>
              </table>
            </div>
          </section>
        </div>
      </section>

      <section id="view-history" class="view">
        <div class="section-title">
          <div>
            <p>Comandas emitidas</p>
            <h2>Historial</h2>
          </div>
          <button type="button" class="secondary" id="reloadHistory">Actualizar</button>
        </div>
        <div id="historyList" class="history-list"></div>
      </section>
    </main>

    <div id="toast" class="toast" role="status" aria-live="polite"></div>
    <script src="assets/app.js"></script>
  </body>
</html>
