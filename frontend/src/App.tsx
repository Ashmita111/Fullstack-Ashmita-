import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { logout } from './api';
import { AllItemsPage } from './pages/AllItemsPage';
import { CategoryItemsPage } from './pages/CategoryItemsPage';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryCategoriesPage } from './pages/InventoryCategoriesPage';
import { InventoriesPage } from './pages/InventoriesPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Spinner } from './components/Spinner';
import { Button } from './components/ui/Button';
import { useCurrentUser } from './hooks/useCurrentUser';

function ProtectedLayout() {
  const navigate = useNavigate();
  const token = typeof window !== 'undefined' ? localStorage.getItem('inventrack_token') : null;
  const { user, loading } = useCurrentUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
        <Spinner />
      </div>
    );
  }

  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link to="/" className="text-lg font-semibold text-slate-900">
              InvenTrack
            </Link>
            <nav className="flex flex-wrap items-center gap-2">
              <Link to="/" className="rounded-2xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                Dashboard
              </Link>
              <Link to="/inventories" className="rounded-2xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                Inventories
              </Link>
              <Link to="/items" className="rounded-2xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                All items
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {user ? (
              <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
                Signed in as <span className="font-semibold text-slate-900">{user.name ?? user.email}</span>
              </div>
            ) : null}
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/inventories" element={<InventoriesPage />} />
          <Route path="/inventories/:invId/categories" element={<InventoryCategoriesPage />} />
          <Route path="/inventories/:invId/categories/:catId/items" element={<CategoryItemsPage />} />
          <Route path="/items" element={<AllItemsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
