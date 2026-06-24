import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/context/theme-context";
import { ContactModalProvider } from "@/context/contact-modal-context";
import { ContactModal } from "@/components/ui/contact-modal";

const Home = lazy(() => import("./components/pages/home"));
const Login = lazy(() => import("./components/pages/login"));
const Register = lazy(() => import("./components/pages/register"));
const Onboarding = lazy(() => import("./components/pages/onboarding"));
const Dashboard = lazy(() => import("./components/pages/dashboard"));
const Terms = lazy(() => import("./components/pages/terms"));
const NotFound = lazy(() => import("./components/pages/not-found"));
const AI = lazy(() => import("./components/pages/ai"));
const Kanban = lazy(() => import("./components/kanban/kanban"));
const Settings = lazy(() => import("./components/pages/settings"));
const Boards = lazy(() => import("./components/pages/boards.tsx"));
import Layout from "./components/layout/Layout";
import Workspaces from "./components/kanban/Workspaces";
import Board from "./components/kanban/Board";

import { ProtectedRoute, PublicRoute } from "@/components/auth";

function RouteFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background text-foreground dark:bg-slate-950 dark:text-white">
      <p className="font-sans text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ContactModalProvider>
        <AuthProvider>
        <div className="min-h-svh bg-background text-foreground dark:bg-slate-950 dark:text-white transition-colors duration-200">
          <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                {/* Public / Unwrapped Routes */}
                <Route index path="/" element={<Home />} />
                <Route path="/terms" element={<Terms />} />
                
                {/* Public Routes (Only for unauthenticated users) */}
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/board/:boardId" element={<Board />} />
                  
                  {/* Routes Wrapped in Layout Sidebar */}
                  <Route element={<Layout />}>
                    <Route path="/workspaces" element={<Workspaces />} />
                    <Route path="/kanban" element={<Kanban />} />
                    <Route path="/ai" element={<AI />} />
                    <Route path="/boards" element={<Boards />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <ContactModal />
        </div>
      </AuthProvider>
      </ContactModalProvider>
    </ThemeProvider>
  );
}

export default App;
