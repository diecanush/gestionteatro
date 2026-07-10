const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');
const { ThermalPrinter, PrinterTypes } = require('node-thermal-printer');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const PRINTER_INTERFACE = process.env.PRINTER_INTERFACE || 'tcp://192.168.1.100:9100';
const PRINTER_TYPE = process.env.PRINTER_TYPE || 'EPSON';
const LINE_WIDTH = Number(process.env.PRINTER_LINE_WIDTH || 32);
const SALON_DIR = path.join(__dirname, 'salon');
const SALON_PUBLIC_DIR = path.join(SALON_DIR, 'public');
const SALON_DATA_DIR = path.join(SALON_DIR, 'data');
const SALON_PRODUCTS_FILE = path.join(SALON_DATA_DIR, 'productos.json');
const SALON_ORDERS_FILE = path.join(SALON_DATA_DIR, 'comandas.json');

const printer = new ThermalPrinter({
  type: PrinterTypes[PRINTER_TYPE] || PrinterTypes.EPSON || PrinterTypes.NET,
  interface: PRINTER_INTERFACE,
  characterSet: 'SLOVENIA',
  removeSpecialCharacters: false,
  lineCharacter: '-',
  options: {
    timeout: 5000,
  },
});

const callPrinter = (method, ...args) => {
  if (typeof printer[method] === 'function') {
    printer[method](...args);
  }
};

const normalizeText = (value) => String(value ?? '').trim();

const center = (text, width = LINE_WIDTH) => {
  const value = normalizeText(text);
  if (value.length >= width) return value;
  const padding = Math.floor((width - value.length) / 2);
  return `${' '.repeat(padding)}${value}`;
};

const line = (char = '-') => char.repeat(LINE_WIDTH);

const defaultSalonProducts = [
  {
    id: 'prod-empanada-carne',
    name: 'Empanada carne',
    category: 'Cocina',
    price: 0,
    stock: 0,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-pizza-muzzarella',
    name: 'Pizza muzzarella',
    category: 'Cocina',
    price: 0,
    stock: 0,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const ensureSalonData = async () => {
  await fs.mkdir(SALON_DATA_DIR, { recursive: true });

  try {
    await fs.access(SALON_PRODUCTS_FILE);
  } catch {
    await writeJson(SALON_PRODUCTS_FILE, defaultSalonProducts);
  }

  try {
    await fs.access(SALON_ORDERS_FILE);
  } catch {
    await writeJson(SALON_ORDERS_FILE, []);
  }
};

const readJson = async (file, fallback) => {
  try {
    const content = await fs.readFile(file, 'utf8');
    const data = JSON.parse(content || 'null');
    return data ?? fallback;
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
};

const writeJson = async (file, data) => {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmpFile = `${file}.tmp`;
  await fs.writeFile(tmpFile, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  await fs.rename(tmpFile, file);
};

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const sanitizeProductInput = (body = {}) => ({
  name: normalizeText(body.name),
  category: normalizeText(body.category || 'General'),
  price: Math.max(0, normalizeNumber(body.price, 0)),
  stock: Math.max(0, Math.floor(normalizeNumber(body.stock, 0))),
  active: body.active !== false,
});

const sortProducts = (products) => [...products].sort((a, b) => {
  const byCategory = normalizeText(a.category).localeCompare(normalizeText(b.category), 'es');
  if (byCategory !== 0) return byCategory;
  return normalizeText(a.name).localeCompare(normalizeText(b.name), 'es');
});

const findOrder = async (id) => {
  const orders = await readJson(SALON_ORDERS_FILE, []);
  return { orders, order: orders.find((item) => item.id === id) };
};

const formatKitchenCommandText = ({ title = 'COCINA', tableNumber, customerName, items = [], createdAt = new Date() }) => {
  const heading = normalizeText(title || 'COCINA').toUpperCase();
  const destination = tableNumber ? `MESA ${tableNumber}` : (customerName ? `BARRA ${customerName}` : 'BARRA');
  const date = new Date(createdAt);
  const time = Number.isNaN(date.getTime())
    ? new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  const lines = [
    center(heading),
    center(destination),
    center(time),
    line('='),
  ];

  items.forEach((item) => {
    const quantity = Number(item.quantity || 1);
    const name = normalizeText(item.productName || item.name || item.product?.name || 'Producto').toUpperCase();
    const half = item.isHalf || item.ishalf ? ' 1/2' : '';

    lines.push(`${quantity} X ${name}${half}`);

    if (item.notes) {
      lines.push(`  ${normalizeText(item.notes).toUpperCase()}`);
    }

    lines.push('');
  });

  lines.push(line('='));
  lines.push(center('ONIRICO SUR'));

  return `${lines.join('\n')}\n`;
};

const printKitchenCommand = async (command) => {
  const { title = 'COCINA', tableNumber, customerName, items = [], createdAt } = command;
  const heading = normalizeText(title || 'COCINA').toUpperCase();
  const destination = tableNumber ? `MESA ${tableNumber}` : (customerName ? `BARRA ${customerName}` : 'BARRA');
  const date = new Date(createdAt || Date.now());
  const time = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  callPrinter('clear');
  callPrinter('alignCenter');
  callPrinter('setTextQuadArea');
  printer.println(heading);
  callPrinter('setTextNormal');
  callPrinter('newLine');

  callPrinter('setTextDoubleHeight');
  callPrinter('setTextDoubleWidth');
  printer.println(destination);
  callPrinter('setTextNormal');
  printer.println(time);
  callPrinter('drawLine');

  callPrinter('alignLeft');
  items.forEach((item) => {
    const quantity = Number(item.quantity || 1);
    const name = normalizeText(item.productName || item.name || item.product?.name || 'Producto').toUpperCase();
    const half = item.isHalf || item.ishalf ? ' 1/2' : '';

    callPrinter('bold', true);
    callPrinter('setTextDoubleHeight');
    printer.println(`${quantity} X ${name}${half}`);
    callPrinter('setTextNormal');
    callPrinter('bold', false);

    if (item.notes) {
      printer.println(`  ${normalizeText(item.notes).toUpperCase()}`);
    }

    callPrinter('newLine');
  });

  callPrinter('drawLine');
  callPrinter('alignCenter');
  printer.println('ONIRICO SUR');
  callPrinter('cut');
  await printer.execute();
};

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    printerInterface: PRINTER_INTERFACE,
    printerType: PRINTER_TYPE,
  });
});

app.use('/salon', express.static(SALON_PUBLIC_DIR));

app.get('/salon/api/products', async (req, res) => {
  try {
    await ensureSalonData();
    const products = await readJson(SALON_PRODUCTS_FILE, []);
    res.json({ ok: true, products: sortProducts(products) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/salon/api/products', async (req, res) => {
  try {
    await ensureSalonData();
    const input = sanitizeProductInput(req.body);

    if (!input.name) {
      return res.status(400).json({ ok: false, error: 'El producto necesita un nombre.' });
    }

    const now = new Date().toISOString();
    const products = await readJson(SALON_PRODUCTS_FILE, []);
    const product = {
      id: createId('prod'),
      ...input,
      createdAt: now,
      updatedAt: now,
    };

    products.push(product);
    await writeJson(SALON_PRODUCTS_FILE, products);
    res.status(201).json({ ok: true, product });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.put('/salon/api/products/:id', async (req, res) => {
  try {
    await ensureSalonData();
    const input = sanitizeProductInput(req.body);

    if (!input.name) {
      return res.status(400).json({ ok: false, error: 'El producto necesita un nombre.' });
    }

    const products = await readJson(SALON_PRODUCTS_FILE, []);
    const index = products.findIndex((product) => product.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ ok: false, error: 'Producto no encontrado.' });
    }

    products[index] = {
      ...products[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    await writeJson(SALON_PRODUCTS_FILE, products);
    res.json({ ok: true, product: products[index] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.delete('/salon/api/products/:id', async (req, res) => {
  try {
    await ensureSalonData();
    const products = await readJson(SALON_PRODUCTS_FILE, []);
    const nextProducts = products.filter((product) => product.id !== req.params.id);

    if (nextProducts.length === products.length) {
      return res.status(404).json({ ok: false, error: 'Producto no encontrado.' });
    }

    await writeJson(SALON_PRODUCTS_FILE, nextProducts);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/salon/api/orders', async (req, res) => {
  try {
    await ensureSalonData();
    const orders = await readJson(SALON_ORDERS_FILE, []);
    res.json({ ok: true, orders: [...orders].reverse() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/salon/api/orders', async (req, res) => {
  try {
    await ensureSalonData();
    const requestedItems = Array.isArray(req.body?.items) ? req.body.items : [];

    if (requestedItems.length === 0) {
      return res.status(400).json({ ok: false, error: 'La comanda debe incluir productos.' });
    }

    const products = await readJson(SALON_PRODUCTS_FILE, []);
    const productById = new Map(products.map((product) => [product.id, product]));
    const orderItems = [];

    for (const requestedItem of requestedItems) {
      const product = productById.get(requestedItem.productId);
      const quantity = Math.max(1, Math.floor(normalizeNumber(requestedItem.quantity, 1)));

      if (!product || product.active === false) {
        return res.status(400).json({ ok: false, error: 'La comanda incluye un producto inexistente o inactivo.' });
      }

      if (quantity > Number(product.stock || 0)) {
        return res.status(400).json({ ok: false, error: `Stock insuficiente para ${product.name}.` });
      }

      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: Number(product.price || 0),
        totalPrice: Number(product.price || 0) * quantity,
        notes: normalizeText(requestedItem.notes),
      });
    }

    const now = new Date().toISOString();
    const order = {
      id: createId('cmd'),
      tableNumber: normalizeText(req.body.tableNumber),
      customerName: normalizeText(req.body.customerName),
      notes: normalizeText(req.body.notes),
      items: orderItems,
      total: orderItems.reduce((sum, item) => sum + item.totalPrice, 0),
      createdAt: now,
      printStatus: 'pending',
      printError: '',
    };

    orderItems.forEach((item) => {
      const product = productById.get(item.productId);
      product.stock = Math.max(0, Number(product.stock || 0) - item.quantity);
      product.updatedAt = now;
    });

    const orders = await readJson(SALON_ORDERS_FILE, []);
    orders.push(order);
    await writeJson(SALON_PRODUCTS_FILE, products);
    await writeJson(SALON_ORDERS_FILE, orders);

    try {
      await printer.isPrinterConnected();
      await printKitchenCommand({
        ...order,
        title: 'SALON',
        saleId: order.id.replace('cmd-', '').slice(0, 10),
      });
      order.printStatus = 'printed';
      order.printedAt = new Date().toISOString();
    } catch (printError) {
      order.printStatus = 'error';
      order.printError = printError.message;
    }

    const currentOrders = await readJson(SALON_ORDERS_FILE, []);
    const orderIndex = currentOrders.findIndex((item) => item.id === order.id);
    if (orderIndex !== -1) {
      currentOrders[orderIndex] = order;
      await writeJson(SALON_ORDERS_FILE, currentOrders);
    }

    res.status(201).json({ ok: true, order, printOk: order.printStatus === 'printed' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/salon/api/orders/:id/preview', async (req, res) => {
  try {
    await ensureSalonData();
    const { order } = await findOrder(req.params.id);

    if (!order) {
      return res.status(404).type('text/plain; charset=utf-8').send('Comanda no encontrada.');
    }

    res.type('text/plain; charset=utf-8').send(formatKitchenCommandText(order));
  } catch (e) {
    console.error(e);
    res.status(500).type('text/plain; charset=utf-8').send(e.message);
  }
});

app.post('/salon/api/orders/:id/reprint', async (req, res) => {
  try {
    await ensureSalonData();
    const { orders, order } = await findOrder(req.params.id);

    if (!order) {
      return res.status(404).json({ ok: false, error: 'Comanda no encontrada.' });
    }

    await printer.isPrinterConnected();
    await printKitchenCommand(order);

    order.printStatus = 'printed';
    order.printError = '';
    order.printedAt = new Date().toISOString();
    await writeJson(SALON_ORDERS_FILE, orders);
    res.json({ ok: true, order });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/preview-comanda', (req, res) => {
  res.type('text/plain; charset=utf-8').send(formatKitchenCommandText(req.body || {}));
});

app.get('/preview-comanda', (req, res) => {
  const sample = {
    tableNumber: req.query.mesa || 7,
    items: [
      { quantity: 2, productName: 'Empanada Carne' },
      { quantity: 1, productName: 'Pizza Muzzarella', isHalf: true },
      { quantity: 3, productName: 'Papas Fritas', notes: 'Sin sal' },
    ],
  };

  res.type('text/plain; charset=utf-8').send(formatKitchenCommandText(sample));
});

app.post('/imprimir-comanda', async (req, res) => {
  try {
    const { items } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, error: 'La comanda debe incluir items.' });
    }

    await printer.isPrinterConnected();
    await printKitchenCommand(req.body);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/imprimir', async (req, res) => {
  try {
    const { texto } = req.body;
    await printer.isPrinterConnected();
    callPrinter('clear');
    printer.println(texto);
    callPrinter('cut');
    await printer.execute();
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Microservicio escuchando en http://localhost:3000');
  console.log(`Impresora configurada: ${PRINTER_TYPE} ${PRINTER_INTERFACE}`);
});
