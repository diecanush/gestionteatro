import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DashboardIcon, WorkshopIcon, ShowIcon, SnackBarIcon, LogoIcon, KitchenIcon } from './icons';
import { Clock, Package, ChevronDown, ChevronUp, ShoppingCart, PackagePlus } from 'lucide-react';

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  to: string;
  onClick?: () => void;
  className?: string; // Added className prop
}> = ({ icon, label, to, onClick, className }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <li>
      <Link
        to={to}
        onClick={onClick}
        className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${
          isActive
            ? 'bg-brand-accent text-white shadow-lg'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-brand-blue dark:hover:text-white'
        } ${className || ''}`}
      >
        {icon}
        <span className="ml-4 font-medium">{label}</span>
      </Link>
    </li>
  );
};

const Sidebar: React.FC<{ isOpen: boolean; toggleSidebar: () => void }> = ({ isOpen, toggleSidebar }) => {
  const [isSnackbarSubmenuOpen, setIsSnackbarSubmenuOpen] = useState(false);
  const location = useLocation();

  // Open submenu if any of its children are active
  useEffect(() => {
    if (location.pathname.startsWith('/products') || location.pathname.startsWith('/kitchen')) {
      setIsSnackbarSubmenuOpen(true);
    }
  }, [location.pathname]);

  const handleSnackbarClick = () => {
    setIsSnackbarSubmenuOpen(!isSnackbarSubmenuOpen);
    // Optionally, navigate to /snackbar if it's not already the current path
    if (location.pathname !== '/snackbar') {
      // This would require a navigate hook, which is not available here directly
      // For now, we'll just toggle the submenu
    }
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-brand-navy text-gray-800 dark:text-white flex flex-col p-4 shadow-2xl transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
      <div className="flex items-center mb-8 px-2 justify-between">
        <div className="flex items-center">
          <LogoIcon className="h-10 w-10 rounded-md" />
          <h1 className="text-xl font-bold ml-3">Onírico Sur</h1>
        </div>
        <button onClick={toggleSidebar} className="lg:hidden text-gray-600 dark:text-gray-300 focus:outline-none">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav>
        <ul>
          <NavItem
            icon={<DashboardIcon className="h-6 w-6" />}
            label="Dashboard"
            to="/"
            onClick={toggleSidebar}
          />
          <NavItem
            icon={<WorkshopIcon className="h-6 w-6" />}
            label="Talleres"
            to="/workshops"
            onClick={toggleSidebar}
          />
          <NavItem
            icon={<ShowIcon className="h-6 w-6" />}
            label="Espectáculos"
            to="/shows"
            onClick={toggleSidebar}
          />
          {/* Snack Bar with Submenu */}
          <li>
            <div className="flex items-center justify-between p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 
              ${location.pathname.startsWith('/snackbar') || location.pathname.startsWith('/products') || location.pathname.startsWith('/kitchen')
                ? 'bg-brand-accent text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-brand-blue dark:hover:text-white'
              }"
            >
              <Link
                to="/snackbar"
                onClick={toggleSidebar}
                className="flex items-center flex-grow"
              >
                <SnackBarIcon className="h-6 w-6" />
                <span className="ml-4 font-medium">Snack Bar</span>
              </Link>
              <span className="ml-auto" onClick={handleSnackbarClick}>
                {isSnackbarSubmenuOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </span>
            </div>
            {isSnackbarSubmenuOpen && (
              <ul className="ml-6">
                  <NavItem
                    icon={<Package className="h-6 w-6" />}
                    label="Gestión Productos"
                    to="/products"
                    onClick={toggleSidebar}
                  />
                  <NavItem
                    icon={<PackagePlus className="h-6 w-6" />}
                    label="Gestión de Combos"
                    to="/products/combos"
                    onClick={toggleSidebar}
                  />
                  <NavItem
                    icon={<ShoppingCart className="h-6 w-6" />}
                    label="Compras"
                    to="/products/purchase"
                    onClick={toggleSidebar}
                />
                <NavItem
                  icon={<KitchenIcon className="h-6 w-6" />}
                  label="Cocina"
                  to="/kitchen"
                  onClick={toggleSidebar}
                />
                <NavItem
                  icon={<Clock className="h-6 w-6" />}
                  label="Historial Comandas"
                  to="/kitchen/history"
                  onClick={toggleSidebar}
                />
                <NavItem
                  icon={<Clock className="h-6 w-6" />}
                  label="Historial Ventas"
                  to="/sales/history"
                  onClick={toggleSidebar}
                />
              </ul>
            )}
          </li>
        </ul>
      </nav>
      <div className="mt-auto p-2 text-center text-xs text-gray-400 dark:text-gray-500">
        <p>&copy; {new Date().getFullYear()} Onírico Sur</p>
        <p>Sistema de Gestión v1.0</p>
      </div>
    </div>
  );
};

export default Sidebar;