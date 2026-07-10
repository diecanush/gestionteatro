<?php

declare(strict_types=1);

$config = require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

try {
    ensureDataFiles($config);
    $action = $_GET['action'] ?? '';
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($action === 'health') {
        jsonResponse(['ok' => true, 'printerCommandUrl' => printerCommandUrl($config)]);
    }

    if ($action === 'products' && $method === 'GET') {
        $products = readJson(productsFile($config), []);
        usort($products, static function (array $a, array $b): int {
            $category = strcmp((string) ($a['category'] ?? ''), (string) ($b['category'] ?? ''));
            return $category !== 0 ? $category : strcmp((string) ($a['name'] ?? ''), (string) ($b['name'] ?? ''));
        });
        jsonResponse(['ok' => true, 'products' => $products]);
    }

    if ($action === 'products' && $method === 'POST') {
        $payload = requestJson();
        $product = sanitizeProduct($payload);

        if ($product['name'] === '') {
            jsonError('El producto necesita un nombre.', 400);
        }

        $products = readJson(productsFile($config), []);
        $now = date(DATE_ATOM);
        $product['id'] = createId('prod');
        $product['createdAt'] = $now;
        $product['updatedAt'] = $now;
        $products[] = $product;
        writeJson(productsFile($config), $products);
        jsonResponse(['ok' => true, 'product' => $product], 201);
    }

    if ($action === 'product' && $method === 'PUT') {
        $id = trim((string) ($_GET['id'] ?? ''));
        $payload = requestJson();
        $input = sanitizeProduct($payload);

        if ($id === '') {
            jsonError('Falta el id del producto.', 400);
        }
        if ($input['name'] === '') {
            jsonError('El producto necesita un nombre.', 400);
        }

        $products = readJson(productsFile($config), []);
        $index = findIndexById($products, $id);
        if ($index === -1) {
            jsonError('Producto no encontrado.', 404);
        }

        $products[$index] = array_merge($products[$index], $input, ['updatedAt' => date(DATE_ATOM)]);
        writeJson(productsFile($config), $products);
        jsonResponse(['ok' => true, 'product' => $products[$index]]);
    }

    if ($action === 'product' && $method === 'DELETE') {
        $id = trim((string) ($_GET['id'] ?? ''));
        $products = readJson(productsFile($config), []);
        $next = array_values(array_filter($products, static fn (array $product): bool => ($product['id'] ?? '') !== $id));

        if (count($next) === count($products)) {
            jsonError('Producto no encontrado.', 404);
        }

        writeJson(productsFile($config), $next);
        jsonResponse(['ok' => true]);
    }

    if ($action === 'orders' && $method === 'GET') {
        $orders = readJson(ordersFile($config), []);
        jsonResponse(['ok' => true, 'orders' => array_reverse($orders)]);
    }

    if ($action === 'orders' && $method === 'POST') {
        $payload = requestJson();
        $result = createOrder($config, $payload);
        jsonResponse($result, 201);
    }

    if ($action === 'preview' && $method === 'GET') {
        $id = trim((string) ($_GET['id'] ?? ''));
        $orders = readJson(ordersFile($config), []);
        $index = findIndexById($orders, $id);
        if ($index === -1) {
            jsonError('Comanda no encontrada.', 404);
        }
        jsonResponse(['ok' => true, 'preview' => buildPreview($orders[$index])]);
    }

    if ($action === 'reprint' && $method === 'POST') {
        $id = trim((string) ($_GET['id'] ?? ''));
        $orders = readJson(ordersFile($config), []);
        $index = findIndexById($orders, $id);
        if ($index === -1) {
            jsonError('Comanda no encontrada.', 404);
        }

        $print = printOrder($config, $orders[$index]);
        $orders[$index]['printStatus'] = $print['ok'] ? 'printed' : 'error';
        $orders[$index]['printError'] = $print['ok'] ? '' : $print['error'];
        $orders[$index]['printedAt'] = date(DATE_ATOM);
        writeJson(ordersFile($config), $orders);
        jsonResponse(['ok' => true, 'order' => $orders[$index], 'printOk' => $print['ok']]);
    }

    jsonError('Ruta no encontrada.', 404);
} catch (Throwable $error) {
    jsonError($error->getMessage(), 500);
}

function createOrder(array $config, array $payload): array
{
    $requestedItems = $payload['items'] ?? [];
    if (!is_array($requestedItems) || count($requestedItems) === 0) {
        jsonError('La comanda debe incluir productos.', 400);
    }

    $products = readJson(productsFile($config), []);
    $items = [];

    foreach ($requestedItems as $requestedItem) {
        if (!is_array($requestedItem)) {
            continue;
        }

        $productId = trim((string) ($requestedItem['productId'] ?? ''));
        $quantity = max(1, (int) ($requestedItem['quantity'] ?? 1));
        $index = findIndexById($products, $productId);

        if ($index === -1 || ($products[$index]['active'] ?? true) === false) {
            jsonError('La comanda incluye un producto inexistente o inactivo.', 400);
        }

        $stock = (int) ($products[$index]['stock'] ?? 0);
        if ($quantity > $stock) {
            jsonError('Stock insuficiente para ' . (string) $products[$index]['name'] . '.', 400);
        }

        $price = (float) ($products[$index]['price'] ?? 0);
        $items[] = [
            'productId' => $productId,
            'productName' => (string) $products[$index]['name'],
            'quantity' => $quantity,
            'unitPrice' => $price,
            'totalPrice' => $price * $quantity,
            'notes' => trim((string) ($requestedItem['notes'] ?? '')),
        ];

        $products[$index]['stock'] = $stock - $quantity;
        $products[$index]['updatedAt'] = date(DATE_ATOM);
    }

    $order = [
        'id' => createId('cmd'),
        'title' => 'SALON',
        'tableNumber' => trim((string) ($payload['tableNumber'] ?? '')),
        'customerName' => trim((string) ($payload['customerName'] ?? '')),
        'notes' => trim((string) ($payload['notes'] ?? '')),
        'items' => $items,
        'total' => array_reduce($items, static fn (float $sum, array $item): float => $sum + (float) $item['totalPrice'], 0.0),
        'createdAt' => date(DATE_ATOM),
        'printStatus' => 'pending',
        'printError' => '',
    ];

    $orders = readJson(ordersFile($config), []);
    $orders[] = $order;
    writeJson(productsFile($config), $products);
    writeJson(ordersFile($config), $orders);

    $print = printOrder($config, $order);
    $order['printStatus'] = $print['ok'] ? 'printed' : 'error';
    $order['printError'] = $print['ok'] ? '' : $print['error'];
    $order['printedAt'] = date(DATE_ATOM);

    $orders = readJson(ordersFile($config), []);
    $index = findIndexById($orders, $order['id']);
    if ($index !== -1) {
        $orders[$index] = $order;
        writeJson(ordersFile($config), $orders);
    }

    return ['ok' => true, 'order' => $order, 'printOk' => $print['ok']];
}

function printOrder(array $config, array $order): array
{
    $url = printerCommandUrl($config);
    $payload = json_encode(array_merge($order, ['title' => 'SALON']), JSON_UNESCAPED_UNICODE);

    if ($payload === false) {
        logSalonPrint('No se pudo codificar la comanda para imprimir.', [
            'orderId' => $order['id'] ?? null,
        ]);
        return ['ok' => false, 'error' => 'No se pudo preparar la comanda para imprimir.'];
    }

    $headers = "Content-Type: application/json\r\n";
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => $headers,
            'content' => $payload,
            'timeout' => 8,
            'ignore_errors' => true,
        ],
    ]);

    logSalonPrint('Enviando comanda a impresora.', [
        'url' => $url,
        'orderId' => $order['id'] ?? null,
        'items' => count($order['items'] ?? []),
    ]);

    $response = @file_get_contents($url, false, $context);
    $status = statusCode($http_response_header ?? []);

    if ($response === false || $status < 200 || $status >= 300) {
        logSalonPrint('Fallo la impresion.', [
            'url' => $url,
            'status' => $status,
            'response' => $response === false ? null : $response,
            'headers' => $http_response_header ?? [],
        ]);
        return ['ok' => false, 'error' => 'No se pudo imprimir. Verificar backend PHP de impresión e impresora.'];
    }

    $data = json_decode($response, true);
    if (is_array($data) && ($data['ok'] ?? false) === true) {
        logSalonPrint('Comanda impresa correctamente.', [
            'orderId' => $order['id'] ?? null,
            'status' => $status,
        ]);
        return ['ok' => true, 'error' => ''];
    }

    logSalonPrint('La impresora rechazo la comanda.', [
        'url' => $url,
        'status' => $status,
        'response' => $response,
    ]);
    return ['ok' => false, 'error' => (string) ($data['error'] ?? 'La impresora rechazo la comanda.')];
}

function logSalonPrint(string $message, array $context = []): void
{
    error_log('[salon-php] ' . $message . ' ' . json_encode($context, JSON_UNESCAPED_UNICODE));
}

function buildPreview(array $order): string
{
    $title = strtoupper((string) ($order['title'] ?? 'SALON'));
    $destination = ($order['tableNumber'] ?? '') !== ''
        ? 'MESA ' . (string) $order['tableNumber']
        : (($order['customerName'] ?? '') !== '' ? 'NOMBRE ' . (string) $order['customerName'] : 'BARRA');
    $time = date('H:i', strtotime((string) ($order['createdAt'] ?? 'now')) ?: time());
    $lines = [
        centerText($title),
        centerText($destination),
        centerText($time),
        str_repeat('=', 32),
    ];

    foreach (($order['items'] ?? []) as $item) {
        if (!is_array($item)) {
            continue;
        }
        $lines[] = (int) ($item['quantity'] ?? 1) . ' X ' . strtoupper((string) ($item['productName'] ?? 'Producto'));
        if (($item['notes'] ?? '') !== '') {
            $lines[] = '  ' . strtoupper((string) $item['notes']);
        }
        $lines[] = '';
    }

    $lines[] = str_repeat('=', 32);
    $lines[] = centerText('ONIRICO SUR');
    return implode("\n", $lines) . "\n";
}

function printerCommandUrl(array $config): string
{
    $commandUrl = trim((string) ($config['printer_command_url'] ?? ''));
    if ($commandUrl !== '') {
        return $commandUrl;
    }

    $serviceUrl = trim((string) ($config['printer_service_url'] ?? ''));
    if ($serviceUrl !== '') {
        return rtrim($serviceUrl, '/') . '/imprimir-comanda';
    }

    return 'http://192.168.1.10/comandas/backend-php/public/api/printing/command';
}

function centerText(string $text, int $width = 32): string
{
    $text = trim($text);
    $length = strlen($text);
    if ($length >= $width) {
        return $text;
    }
    return str_repeat(' ', (int) floor(($width - $length) / 2)) . $text;
}

function sanitizeProduct(array $payload): array
{
    return [
        'name' => trim((string) ($payload['name'] ?? '')),
        'category' => trim((string) ($payload['category'] ?? 'General')),
        'price' => max(0, (float) ($payload['price'] ?? 0)),
        'stock' => max(0, (int) ($payload['stock'] ?? 0)),
        'active' => ($payload['active'] ?? true) !== false,
    ];
}

function requestJson(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw !== false ? $raw : '', true);
    return is_array($data) ? $data : [];
}

function ensureDataFiles(array $config): void
{
    $dir = (string) $config['data_dir'];
    if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
        throw new RuntimeException('No se pudo crear la carpeta data.');
    }

    if (!is_file(productsFile($config))) {
        writeJson(productsFile($config), defaultProducts());
    }
    if (!is_file(ordersFile($config))) {
        writeJson(ordersFile($config), []);
    }
}

function defaultProducts(): array
{
    $now = date(DATE_ATOM);
    return [
        [
            'id' => 'prod-empanada-carne',
            'name' => 'Empanada carne',
            'category' => 'Cocina',
            'price' => 0,
            'stock' => 0,
            'active' => true,
            'createdAt' => $now,
            'updatedAt' => $now,
        ],
        [
            'id' => 'prod-pizza-muzzarella',
            'name' => 'Pizza muzzarella',
            'category' => 'Cocina',
            'price' => 0,
            'stock' => 0,
            'active' => true,
            'createdAt' => $now,
            'updatedAt' => $now,
        ],
    ];
}

function productsFile(array $config): string
{
    return (string) $config['data_dir'] . DIRECTORY_SEPARATOR . 'productos.json';
}

function ordersFile(array $config): string
{
    return (string) $config['data_dir'] . DIRECTORY_SEPARATOR . 'comandas.json';
}

function readJson(string $file, array $fallback): array
{
    if (!is_file($file)) {
        return $fallback;
    }

    $content = file_get_contents($file);
    $data = json_decode($content !== false ? $content : '', true);
    return is_array($data) ? $data : $fallback;
}

function writeJson(string $file, array $data): void
{
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($json === false || file_put_contents($file, $json . PHP_EOL, LOCK_EX) === false) {
        throw new RuntimeException('No se pudo escribir ' . basename($file) . '.');
    }
}

function findIndexById(array $items, string $id): int
{
    foreach ($items as $index => $item) {
        if (is_array($item) && (string) ($item['id'] ?? '') === $id) {
            return (int) $index;
        }
    }
    return -1;
}

function createId(string $prefix): string
{
    return $prefix . '-' . str_replace('.', '', uniqid('', true));
}

function statusCode(array $headers): int
{
    foreach ($headers as $header) {
        if (preg_match('/^HTTP\/\S+\s+(\d+)/', (string) $header, $matches)) {
            return (int) $matches[1];
        }
    }
    return 0;
}

function jsonResponse(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonError(string $message, int $status): void
{
    jsonResponse(['ok' => false, 'error' => $message], $status);
}
