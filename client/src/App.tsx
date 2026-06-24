import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { AuthProvider } from "@/context/auth-context";

const Home = lazy(() => import("./components/pages/home"));
const Login = lazy(() => import("./components/pages/login"));
const Register = lazy(() => import("./components/pages/register"));
const Onboarding = lazy(() => import("./components/pages/onboarding"));
const Dashboard = lazy(() => import("./components/pages/dashboard"));
const Terms = lazy(() => import("./components/pages/terms"));
const NotFound = lazy(() => import("./components/pages/not-found"));
const AI = lazy(() => import("./components/pages/ai"));
const Kanban = lazy(() => import("./components/kanban/kanban"));

function RouteFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background text-foreground">
      <p className="font-sans text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-svh bg-background text-foreground">
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route index path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/ai" element={<AI />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/kanban" element={<Kanban />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
