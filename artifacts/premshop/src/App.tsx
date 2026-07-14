import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from '@/hooks/use-auth';
import { Layout } from '@/components/layout';

import Home from '@/pages/home';
import Products from '@/pages/products';
import CategoryPage from '@/pages/category';
import ProductDetail from '@/pages/product-detail';
import Announcements from '@/pages/announcements';
import Login from '@/pages/login';
import Register from '@/pages/register';

import Dashboard from '@/pages/dashboard';
import Topup from '@/pages/topup';
import History from '@/pages/history';
import Tickets from '@/pages/tickets';

import AdminDashboard from '@/pages/admin/dashboard';
import AdminProducts from '@/pages/admin/products';
import AdminCategories from '@/pages/admin/categories';
import AdminUsers from '@/pages/admin/users';
import AdminOrders from '@/pages/admin/orders';
import AdminTopups from '@/pages/admin/topups';
import AdminAnnouncements from '@/pages/admin/announcements';

import NotFound from '@/pages/not-found';

function Router() {
  return (
    <Layout>
      <Switch>
        {/* Public Routes */}
        <Route path="/" component={Home} />
        <Route path="/products" component={Products} />
        <Route path="/category/:slug" component={CategoryPage} />
        <Route path="/product/:id" component={ProductDetail} />
        <Route path="/announcements" component={Announcements} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/topup" component={Topup} />
        <Route path="/history" component={History} />
        <Route path="/tickets" component={Tickets} />
        
        {/* Admin Routes */}
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/products" component={AdminProducts} />
        <Route path="/admin/categories" component={AdminCategories} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/topup" component={AdminTopups} />
        <Route path="/admin/announcements" component={AdminAnnouncements} />
        
        {/* Fallback */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
