import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToHash from "./components/ScrollToHash";
import Index from "./pages/Index";
import GraciasPage from "./pages/GraciasPage";
import NotFound from "./pages/NotFound";
import SobreNosotros from "./pages/SobreNosotros";
import Privacidad from "./pages/Privacidad";
import Terminos from "./pages/Terminos";
import Miraflores from "./pages/distritos/Miraflores";
import Barranco from "./pages/distritos/Barranco";
import SanIsidro from "./pages/distritos/SanIsidro";
import MagdalenaDelMar from "./pages/distritos/MagdalenaDelMar";
import { AuthProvider } from "./admin/AuthContext";
import { ContactModalProvider } from "./components/ContactModalProvider";

const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Login = lazy(() => import("./admin/Login"));
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const PostsList = lazy(() => import("./admin/PostsList"));
const PostEditor = lazy(() => import("./admin/PostEditor"));
const OwnerTestimonialsAdmin = lazy(() => import("./admin/OwnerTestimonialsAdmin"));
const GuestTestimonialsAdmin = lazy(() => import("./admin/GuestTestimonialsAdmin"));
const LeadsAdmin = lazy(() => import("./admin/LeadsAdmin"));
const HeroImagesAdmin = lazy(() => import("./admin/HeroImagesAdmin"));

const queryClient = new QueryClient();

const BlogFallback = () => (
  <div className="min-h-screen bg-dark-gray" />
);

const AdminFallback = () => (
  <div className="min-h-screen bg-[#0e0f10]" />
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ContactModalProvider>
          <ScrollToHash />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/gracias" element={<GraciasPage />} />
            <Route path="/sobre-nosotros" element={<SobreNosotros />} />
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="/terminos" element={<Terminos />} />
            <Route
              path="/blog"
              element={
                <Suspense fallback={<BlogFallback />}>
                  <Blog />
                </Suspense>
              }
            />
            <Route
              path="/blog/:slug"
              element={
                <Suspense fallback={<BlogFallback />}>
                  <BlogPost />
                </Suspense>
              }
            />
            <Route path="/administracion-airbnb-miraflores" element={<Miraflores />} />
            <Route path="/administracion-airbnb-barranco" element={<Barranco />} />
            <Route path="/administracion-airbnb-san-isidro" element={<SanIsidro />} />
            <Route path="/administracion-airbnb-magdalena-del-mar" element={<MagdalenaDelMar />} />

            {/* ── CMS ─────────────────────────────────────────────── */}
            <Route
              path="/login"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <Login />
                </Suspense>
              }
            />
            <Route
              path="/admin"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <AdminLayout />
                </Suspense>
              }
            >
              <Route index element={<Navigate to="/admin/posts" replace />} />
              <Route
                path="posts"
                element={
                  <Suspense fallback={<AdminFallback />}>
                    <PostsList />
                  </Suspense>
                }
              />
              <Route
                path="posts/new"
                element={
                  <Suspense fallback={<AdminFallback />}>
                    <PostEditor />
                  </Suspense>
                }
              />
              <Route
                path="posts/:id"
                element={
                  <Suspense fallback={<AdminFallback />}>
                    <PostEditor />
                  </Suspense>
                }
              />
              <Route
                path="testimonios-propietarios"
                element={
                  <Suspense fallback={<AdminFallback />}>
                    <OwnerTestimonialsAdmin />
                  </Suspense>
                }
              />
              <Route
                path="testimonios-huespedes"
                element={
                  <Suspense fallback={<AdminFallback />}>
                    <GuestTestimonialsAdmin />
                  </Suspense>
                }
              />
              <Route
                path="leads"
                element={
                  <Suspense fallback={<AdminFallback />}>
                    <LeadsAdmin />
                  </Suspense>
                }
              />
              <Route
                path="hero"
                element={
                  <Suspense fallback={<AdminFallback />}>
                    <HeroImagesAdmin />
                  </Suspense>
                }
              />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </ContactModalProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
