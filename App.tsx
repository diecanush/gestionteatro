
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/Dashboard';
import WorkshopsPage from './pages/workshops/WorkshopsPage';
import ShowsPage from './pages/shows/ShowsPage';
import SnackBarPOSPage from './pages/snackbar/SnackBarPOSPage';
import ShowForm from './pages/shows/ShowForm';
import WorkshopForm from './pages/workshops/WorkshopForm';
import { KitchenDisplayPage } from './pages/kitchen/KitchenDisplayPage';
import KitchenHistoryPage from './pages/kitchen/KitchenHistoryPage';
import ProductManagementPage from './pages/products/ProductManagementPage';
import ProductForm from './components/ProductForm';
import ProductPurchasePage from './pages/products/ProductPurchasePage';
import SalesHistoryPage from './pages/sales/SalesHistoryPage';

const AppContent: React.FC = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const location = useLocation();

  const getPageTitle = (pathname: string): string => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/workshops/new')) return 'Crear Taller';
    if (pathname.startsWith('/workshops/edit')) return 'Editar Taller';
    if (pathname.startsWith('/workshops')) return 'Gestión de Talleres';
    if (pathname.startsWith('/shows/new')) return 'Crear Espectáculo';
    if (pathname.startsWith('/shows/edit')) return 'Editar Espectáculo';
    if (pathname.startsWith('/shows')) return 'Gestión de Espectáculos';
    if (pathname.startsWith('/snackbar')) return 'Punto de Venta - Snack Bar';
    if (pathname.startsWith('/sales/history')) return 'Historial de Ventas';
    if (pathname.startsWith('/products/new')) return 'Nuevo Producto';
    if (pathname.startsWith('/products/edit')) return 'Editar Producto';
    if (pathname.startsWith('/products/purchase')) return 'Compras';
    if (pathname.startsWith('/products')) return 'Gestión de Productos';
    if (pathname.startsWith('/kitchen/history')) return 'Historial de Comandas';
    if (pathname.startsWith('/kitchen')) return 'Comandas de Cocina';
    return 'Onírico Sur';
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen dark:bg-brand-navy font-sans">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getPageTitle(location.pathname)} theme={theme} toggleTheme={toggleTheme} toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-brand-dark p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/workshops" element={<WorkshopsPage />} />
            <Route path="/workshops/new" element={<WorkshopForm />} />
            <Route path="/workshops/edit/:id" element={<WorkshopForm />} />
            <Route path="/shows" element={<ShowsPage />} />
            <Route path="/shows/new" element={<ShowForm />} />
            <Route path="/shows/edit/:id" element={<ShowForm />} />
            <Route path="/snackbar" element={<SnackBarPOSPage />} />
            <Route path="/sales/history" element={<SalesHistoryPage />} />
            <Route path="/products" element={<ProductManagementPage />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/edit/:id" element={<ProductForm />} />
            <Route path="/products/purchase" element={<ProductPurchasePage />} />
            <Route path="/kitchen" element={<KitchenDisplayPage />} />
            <Route path="/kitchen/history" element={<KitchenHistoryPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;