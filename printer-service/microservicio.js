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