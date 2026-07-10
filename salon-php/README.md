# Salon PHP para XAMPP

Mini-app para cargar productos, emitir comandas e historial usando archivos JSON.

## Instalacion

1. Copiar la carpeta `salon-php` dentro del proyecto en XAMPP, por ejemplo:

```text
C:\xampp\htdocs\gestionteatro\salon-php
```

2. Verificar que el backend PHP de `comandas` este funcionando y tenga configurada la impresora.

3. Abrir desde la red local:

```text
http://IP-DE-LA-PC/gestionteatro/salon-php/
```

Ejemplo:

```text
http://192.168.1.50/gestionteatro/salon-php/
```

## Datos

La app no usa base de datos. Guarda todo en:

```text
salon-php/data/productos.json
salon-php/data/comandas.json
```

## Impresion

Por defecto PHP llama al backend PHP de impresion en:

```text
http://127.0.0.1/comandas/backend-php/public/api/printing/command
```

Si `comandas` esta instalado en otra ruta, editar `config.php` o definir:

```text
PRINTER_COMMAND_URL=http://127.0.0.1/otra-ruta/backend-php/public/api/printing/command
```

Las comandas salen con el titulo `SALON` en grande.
