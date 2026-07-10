# Printer Service

Microservicio local para imprimir tickets y comandas en impresoras termicas 80mm.

## Ejecutar

```powershell
cd C:\Users\dieca\Documents\gestionteatro\printer-service
npm.cmd install
npm.cmd start
```

El servicio escucha en:

```text
http://localhost:3000
```

## Comandas de cocina

Endpoint:

```text
POST /imprimir-comanda
```

Payload:

```json
{
  "tableNumber": 4,
  "items": [
    { "quantity": 2, "productName": "Empanada Carne" },
    { "quantity": 1, "productName": "Pizza Muzzarella", "isHalf": true }
  ]
}
```

Preview sin imprimir:

```text
POST /preview-comanda
```

## Salon con stock propio

El microservicio tambien sirve una pantalla independiente para otro salon:

```text
http://localhost:3000/salon
```

Usa archivos JSON locales, sin base de datos:

```text
printer-service/salon/data/productos.json
printer-service/salon/data/comandas.json
```

Pantallas incluidas:

- `Comanda`: carga productos del stock del salon, descuenta stock y envia la comanda a cocina.
- `Productos`: alta, edicion, borrado y stock.
- `Historial`: listado de comandas emitidas, preview y reimpresion.

Endpoints internos:

```text
GET    /salon/api/products
POST   /salon/api/products
PUT    /salon/api/products/:id
DELETE /salon/api/products/:id
GET    /salon/api/orders
POST   /salon/api/orders
GET    /salon/api/orders/:id/preview
POST   /salon/api/orders/:id/reprint
```

## Configurar impresora

Por defecto usa:

```text
PRINTER_TYPE=EPSON
PRINTER_INTERFACE=tcp://192.168.1.100:9100
```

Cuando la POS80 USB este instalada, hay que definir `PRINTER_INTERFACE` segun como Windows la exponga. Casos comunes:

```powershell
$env:PRINTER_INTERFACE='printer:POS80'
npm.cmd start
```

o si queda como puerto USB/serial compatible:

```powershell
$env:PRINTER_INTERFACE='\\\\.\\COM3'
npm.cmd start
```

El nombre exacto se confirma cuando la impresora este conectada e instalada.
