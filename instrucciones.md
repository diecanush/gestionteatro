# Instrucciones para configurar microservicio de impresión de impresora fiscal Hasar SMH/P-250F

Estas instrucciones te guiarán para configurar un microservicio local en Node.js que reciba peticiones HTTP desde tu frontend y las envíe como comandos raw TCP al puerto 9100 de la impresora fiscal.

## Requisitos

- Node.js instalado (v12 o superior).
- Impresora Hasar SMH/P-250F conectada a la LAN (IP fija o DHCP con reserva).
- Conexión de red entre tu PC y la impresora (misma red local).
- (Opcional) npm para instalar dependencias.

## 1. Crear el microservicio en Node.js

1. Crea una carpeta para el proyecto, p.ej. `printer-service` y accede a ella:
   ```bash
   mkdir printer-service
   cd printer-service
   ```
2. Inicializa npm:
   ```bash
   npm init -y
   ```
3. Instala dependencias:
   ```bash
   npm install express cors node-thermal-printer
   ```
4. Crea un archivo `microservicio.js` con el siguiente contenido:
   ```js
   const express = require('express');
   const cors = require('cors');
   const { ThermalPrinter, PrinterTypes } = require('node-thermal-printer');

   const app = express();
   app.use(cors({ origin: '*' }));
   app.use(express.json());

   const printer = new ThermalPrinter({
     type: PrinterTypes.NET,
     interface: 'tcp://192.168.1.100:9100'
   });

   app.post('/imprimir', async (req, res) => {
     try {
       const { texto } = req.body;
       await printer.isPrinterConnected();
       printer.println(texto);
       printer.cut();
       await printer.execute();
       res.json({ ok: true });
     } catch (e) {
       console.error(e);
       res.status(500).json({ ok: false, error: e.message });
     }
   });

   app.listen(3000, '0.0.0.0', () => {
     console.log('Microservicio escuchando en http://localhost:3000');
   });
   ```
5. Arranca el servicio:
   ```bash
   node microservicio.js
   ```

## 2. Configurar el frontend

Desde tu aplicación web (por ejemplo en `http://localhost:8080`), envía peticiones al microservicio:

```js
fetch('http://localhost:3000/imprimir', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ texto: '¡Factura lista para imprimir!' })
})
  .then(res => res.json())
  .then(({ ok }) => {
    if (ok) alert('Enviado a la impresora');
    else alert('Error en la impresión');
  })
  .catch(console.error);
```

Si usas Create-React-App, añade en tu `package.json`:

```json
"proxy": "http://localhost:3000"
```

para evitar problemas de CORS y poder usar rutas relativas (`fetch('/imprimir', ...)`).

## 3. Conexión con la impresora

- **Ethernet**: conecta la impresora a tu router o switch con un cable RJ45 y configúrale una IP (ej. `192.168.1.100`).  
- **USB/Serial**: cambia la configuración de la librería a:
  ```js
  const printer = new ThermalPrinter({
    type: PrinterTypes.USB, // o PrinterTypes.SERIAL
    interface: '/dev/ttyUSB0' // o ruta según tu SO
  });
  ```

## 4. Flujo de trabajo

```
Frontend (HTTP fetch)
       ↓
Microservicio Node.js (HTTP → TCP 9100)
       ↓
Impresora Hasar SMH/P-250F (comandos ESC/POS)
```

## 5. Resumen

- El navegador no puede abrir sockets raw TCP.
- Usa un microservicio HTTP/WebSocket local para traducir las peticiones.
- El microservicio se comunica con la impresora por TCP en el puerto 9100 (o USB/serial).
