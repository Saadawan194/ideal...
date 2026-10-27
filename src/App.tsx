import { ErrorBoundary } from "./components/common/ErrorBoundary";
import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HomePage } from "./pages/HomePage";

// Public Editorial Routes - Lazy Loaded for Maximum PageSpeed
const CategoryListingPage = lazy(() =>
  import("./pages/CategoryListingPage").then((m) => ({
    default: m.CategoryListingPage,
  })),
);
const ProductDetailPage = lazy(() =>
  import("./pages/ProductDetailPage").then((m) => ({
    default: m.ProductDetailPage,
  })),
);
const SpacesPage = lazy(() =>
  import("./pages/SpacesPage").then((m) => ({ default: m.SpacesPage })),
);
const AboutPage = lazy(() =>
  import("./pages/AboutPage").then((m) => ({ default: m.AboutPage })),
);
const ProjectsPage = lazy(() =>
  import("./pages/ProjectsPage").then((m) => ({ default: m.ProjectsPage })),
);
const ContactPage = lazy(() =>
  import("./pages/ContactPage").then((m) => ({ default: m.ContactPage })),
);
const FaqsPage = lazy(() =>
  import("./pages/FaqsPage").then((m) => ({ default: m.FaqsPage })),
);
const TermsPage = lazy(() =>
  import("./pages/TermsPage").then((m) => ({ default: m.TermsPage })),
);
const PrivacyPage = lazy(() =>
  import("./pages/PrivacyPage").then((m) => ({ default: m.PrivacyPage })),
);

// Admin Studio CRM Routes - Lazy Loaded
const AdminLoginPage = lazy(() =>
  import("./pages/admin/AdminLoginPage").then((m) => ({
    default: m.AdminLoginPage,
  })),
);
const AdminBulkUploadPage = lazy(() =>
  import("./pages/admin/AdminBulkUploadPage").then((m) => ({
    default: m.AdminBulkUploadPage,
  })),
);
const AdminLeadsPage = lazy(() =>
  import("./pages/admin/AdminLeadsPage").then((m) => ({
    default: m.AdminLeadsPage,
  })),
);
const AdminProductsPage = lazy(() =>
  import("./pages/admin/AdminProductsPage").then((m) => ({
    default: m.AdminProductsPage,
  })),
);
const AdminCategoriesPage = lazy(() =>
  import("./pages/admin/AdminCategoriesPage").then((m) => ({
    default: m.AdminCategoriesPage,
  })),
);
const AdminSpacesPage = lazy(() =>
  import("./pages/admin/AdminSpacesPage").then((m) => ({
    default: m.AdminSpacesPage,
  })),
);
const AdminHomepageEditor = lazy(() =>
  import("./pages/admin/AdminHomepageEditor").then((m) => ({
    default: m.AdminHomepageEditor,
  })),
);
const AdminSettingsPage = lazy(() =>
  import("./pages/admin/AdminSettingsPage").then((m) => ({
    default: m.AdminSettingsPage,
  })),
);
const AdminMediaPage = lazy(() =>
  import("./pages/admin/AdminMediaPage").then((m) => ({
    default: m.AdminMediaPage,
  })),
);
const AdminBulkProductsPage = lazy(() =>
  import("./pages/admin/AdminBulkProductsPage").then((m) => ({
    default: m.AdminBulkProductsPage,
  })),
);

export function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <ErrorBoundary fallbackTitle="Ideal Furniture System Notice">
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <Routes>
          {/* Public Editorial Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/collections/:slug" element={<CategoryListingPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/spaces" element={<SpacesPage />} />
          <Route path="/spaces/:slug" element={<SpacesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<Navigate to="/about" replace />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faqs" element={<FaqsPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* Admin Studio CRM Routes */}
          <Route
            path="/admin"
            element={<Navigate to="/admin/bulk-upload" replace />}
          />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/bulk-upload" element={<AdminBulkUploadPage />} />
          <Route path="/admin/media" element={<AdminMediaPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route
            path="/admin/bulk-products"
            element={<AdminBulkProductsPage />}
          />
          <Route path="/admin/leads" element={<AdminLeadsPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/spaces" element={<AdminSpacesPage />} />
          <Route path="/admin/homepage" element={<AdminHomepageEditor />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
