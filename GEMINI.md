# Project: Onírico Sur - Sistema de Gestión Teatral

## Overview
This is a web application for managing a theater, including workshops, shows, and a snack bar. It's built with a React frontend and a Node.js/Express/Sequelize backend.

## Technologies
- **Frontend:** React, Vite, TypeScript
- **Backend:** Node.js, Express.js, Sequelize (ORM)
- **Database:** MariaDB

## Key Features Implemented/Assisted With
- **Backend Setup:** Created directory structure (models, controllers, routes), configured database connection (Sequelize with MariaDB).
- **API Endpoints:** Implemented RESTful APIs for Workshops, Students, Shows, SnackBar Products, and SnackBar Sales.
- **Database Schema:** Generated SQL `CREATE TABLE` statements for `workshops`, `students`, `shows`, `snackbar_products`, `workshop_students`, `ticket_sales`, `snackbar_sales`, and `snackbar_sale_items`.
- **Data Population:** Generated SQL `INSERT` statements for `shows`, `snackbar_products`, `workshops`, and `students` based on mock data and user input.
- **Snack Bar Sales & Ticketing:** Implemented full sales flow for the snack bar, including:
    - Backend models (`SnackBarSale`, `SnackBarSaleItem`).
    - Controller logic for creating sales and sale items within a transaction.
    - API routes for confirming sales and fetching sales history.
    - Frontend POS page integration to send orders and receive ticket data.
    - Frontend `TicketModal` for displaying sales tickets.
    - Frontend `SalesHistoryPage` for viewing daily sales.
    - Sidebar navigation for the sales history page.
- **Error Debugging & Resolution:**
    - Handled Sequelize `createdAt`/`updatedAt` column errors by disabling timestamps in models and associations.
    - Fixed frontend `TypeError: Cannot read properties of null (reading 'toLocaleString')` by adding null/invalid date checks for `startDate` and `endDate`.
    - Corrected frontend `TypeError: Cannot read properties of undefined (reading 'length')` by fixing case sensitivity for `workshop.Students`.
    - Resolved backend `Column 'id' cannot be null` error for new students by implementing ID generation in the controller.
    - Debugged and fixed `Unknown column 'saleId'` errors in Sequelize queries by explicitly mapping `saleId` to `sale_id` in `SnackBarSaleItem` model and associations.
    - Added `getSalesHistory` function to `services/api.ts`.

## How to Run
- **Backend:**
    1. Navigate to `C:\Users\dieca\gestionteatro\backend`.
    2. Run `npm install` (if you haven't already).
    3. Update `backend/config/database.js` with your MariaDB credentials.
    4. Execute the SQL scripts (`populate_shows.sql`, `populate_other_tables.sql`, `sales_tables.sql`, `kitchen_orders.sql`) in your MariaDB client.
    5. Run `node server.js`.
- **Frontend:**
    1. Navigate to `C:\Users\dieca\gestionteatro`.
    2. Run `npm install`.
    3. Run `npm run dev`.

## Important Notes
- Remember to restart both frontend and backend servers after making code changes or database updates.
- Clear browser cache (hard refresh) if frontend changes are not reflected.