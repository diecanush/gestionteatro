en /pages/snackbar/SnackBarPOSPage.tsx, cuando confirmo una venta, sale un alert que   │     
│    dice "Venta registrada y comanda(s) generada(s) exitosamente." Esto esta en            │     
│    backend/controllers/salesControllers.js. Ahora necesito que se registren las ventas,   │     
│    se muestre una imagen del ticket en un modal para que el usuario pueda efectuar el     │     
│    cobro y luego se pueda ver en otra página un listado de las ventas separado por día.   │     
│    En la base de datos hay una tabla ticket_sales pero es para la venta de entradas de    │     
│    shows. Entiendo que habría que hacer una tabla para los tickets del snackbar y otra    │     
│    para el detalle de los mismos y luego crear los modelos, los controladores y las       │     
│    rutas.                                                                                 │     
╰───────────────────────────────────────────────────────────────────────────────────────────╯     

✦ Entendido. Es una mejora significativa para el punto de venta. Me parece un plan excelente      
  y has identificado correctamente los pasos necesarios.

  Para implementar esta funcionalidad, propongo el siguiente plan de acción, dividido en
  tres fases principales:

  Fase 1: Base de Datos


   1. Crear Nuevas Tablas: Diseñaré y generaré el código SQL CREATE TABLE para dos nuevas
      tablas:
       * snackbar_sales: Para registrar cada venta individual (ID de venta, total, fecha).        
       * snackbar_sale_items: Para registrar los detalles de cada venta (qué productos, en        
         qué cantidad y a qué precio se vendieron, vinculado al ID de snackbar_sales).

  Fase 2: Backend (Node.js/Express/Sequelize)


   1. Modelos: Crearé los modelos de Sequelize SnackBarSale.js y SnackBarSaleItem.js que se       
      correspondan con las nuevas tablas.
   2. Controlador (`saleController.js`):
       * Modificaré la función actual para que, en lugar de solo enviar una alerta, reciba        
         el carrito de compras desde el frontend.
       * Utilizará una transacción de Sequelize para guardar la información de la venta en        
         snackbar_sales y cada uno de los artículos en snackbar_sale_items. Esto garantiza        
         que la venta se registre completa o no se registre en absoluto, manteniendo la
         consistencia de los datos.
       * Crearé una nueva función para obtener el historial de ventas de la base de datos,        
         ordenado por fecha.
   3. Rutas (`sales.js`):
       * Ajustaré la ruta POST /api/sales para que apunte a la nueva lógica del controlador.      
       * Crearé una nueva ruta GET /api/sales/history para que el frontend pueda solicitar        
         el listado de ventas.

  Fase 3: Frontend (React/TypeScript)


   1. Punto de Venta (`SnackBarPOSPage.tsx`):
       * Modificaré la llamada fetch para enviar los datos del carrito al backend.
       * Al recibir la confirmación del backend, en lugar de un alert, guardaré los datos
         del ticket devuelto y activaré un nuevo componente modal.
   2. Modal de Ticket (`TicketModal.tsx`):
       * Crearé un nuevo componente modal que recibirá los datos de la venta y los mostrará       
         en un formato claro y legible, simulando un ticket de compra.
   3. Página de Historial de Ventas (`SalesHistoryPage.tsx`):
       * Crearé una nueva página y su correspondiente ruta.
       * Esta página hará una llamada a GET /api/sales/history para obtener todas las
         ventas.
       * Procesará los datos recibidos para agrupar las ventas por día y las mostrará en una      
         lista o tabla.
   4. Navegación: Añadiré un enlace en el Sidebar.tsx para poder acceder a la nueva página        
      de historial de ventas.

  Este plan cubre todos los requisitos que mencionaste, desde la base de datos hasta la
  interfaz de usuario final.


  Si estás de acuerdo con este plan, comenzaré con el primer paso: generar el SQL para las        
  nuevas tablas.
