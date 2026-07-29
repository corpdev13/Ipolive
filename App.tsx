import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import AccessPending from './pages/AccessPending';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Management from './pages/Management';
import Support from './pages/Support';
import Orders from './pages/Orders';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/access-pending" component={AccessPending} />
      <Route path="/signin" component={SignIn} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/management" component={Management} />
      <Route path="/support" component={Support} />
      <Route path="/orders" component={Orders} />
      <Route>
        <div className="flex h-screen items-center justify-center font-display text-4xl text-white bg-[#050a0f]">404 NOT FOUND</div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
      <Toaster theme="dark" position="bottom-center" />
    </QueryClientProvider>
  );
}

export default App;