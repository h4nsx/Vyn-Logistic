import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '../../shared/components/feedback/LoadingSpinner';

// Layouts
import { MainLayout } from '../layouts/main-layout';
import { AuthLayout } from '../layouts/auth-layout';
import { AppLayout } from '../layouts/app-layout';
import { RootLayout } from '../layouts/root-layout'; 

// Public Pages
const LoginPage = lazy(() => import('../../pages/public/auth/login.page').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../../pages/public/auth/register.page').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('../../pages/public/auth/forgot-password.page').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../../pages/public/auth/reset-password.page').then(m => ({ default: m.ResetPasswordPage })));
const HomePage = lazy(() => import('../../pages/public/home.page').then(m => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('../../pages/public/about.page').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('../../pages/public/contact.page').then(m => ({ default: m.ContactPage })));
const PrivacyPolicyPage = lazy(() => import('../../pages/public/privacy.page').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsOfServicePage = lazy(() => import('../../pages/public/terms.page').then(m => ({ default: m.TermsOfServicePage })));

// Product Pages
const HowItWorksPage = lazy(() => import('../../pages/public/products/how-it-works.page').then(m => ({ default: m.HowItWorksPage })));
const CoreFeaturesPage = lazy(() => import('../../pages/public/products/core-features.page').then(m => ({ default: m.CoreFeaturesPage })));
const ArchitecturePage = lazy(() => import('../../pages/public/products/architecture.page').then(m => ({ default: m.ArchitecturePage })));
const UseCasesPage = lazy(() => import('../../pages/public/products/use-cases.page').then(m => ({ default: m.UseCasesPage })));

// Resource Pages
const DocumentationPage = lazy(() => import('../../pages/public/resources/documentation.page').then(m => ({ default: m.DocumentationPage })));
const ApiReferencePage = lazy(() => import('../../pages/public/resources/api-reference.page').then(m => ({ default: m.ApiReferencePage })));
const SampleDatasetsPage = lazy(() => import('../../pages/public/resources/sample-dataset.page').then(m => ({ default: m.SampleDatasetsPage })));
const HelpCenterPage = lazy(() => import('../../pages/public/resources/help-center.page').then(m => ({ default: m.HelpCenterPage })));
const DemoPage = lazy(() => import('../../pages/public/demo.page').then(m => ({ default: m.DemoPage })));

// App (Protected) Pages
const DashboardPage = lazy(() => import('../../pages/app/dashboard.page').then(m => ({ default: m.DashboardPage })));
const UploadPage = lazy(() => import('../../pages/app/upload.page').then(m => ({ default: m.UploadPage })));
const DatasetDetailPage = lazy(() => import('../../pages/app/{datasets}/dataset-detail.page').then(m => ({ default: m.DatasetDetailPage })));
const AnalyticsPage = lazy(() => import('../../pages/app/analytics.page').then(m => ({ default: m.AnalyticsPage })));
const DatasetsPage = lazy(() => import('../../pages/app/{datasets}/datasets.page').then(m => ({ default: m.DatasetsPage })));
const SettingsPage = lazy(() => import('../../pages/app/settings.page').then(m => ({ default: m.SettingsPage })));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-surface"><LoadingSpinner label="Loading..." /></div>}>
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    element: <RootLayout />, // Wrap everything in RootLayout
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { index: true, element: <SuspenseWrapper><HomePage /></SuspenseWrapper> },
          { path: 'products/how-it-works', element: <SuspenseWrapper><HowItWorksPage /></SuspenseWrapper> },
          { path: 'products/core-features', element: <SuspenseWrapper><CoreFeaturesPage /></SuspenseWrapper> },
          { path: 'products/architecture', element: <SuspenseWrapper><ArchitecturePage /></SuspenseWrapper> },
          { path: 'products/use-cases', element: <SuspenseWrapper><UseCasesPage /></SuspenseWrapper> },
          { path: 'about-us', element: <SuspenseWrapper><AboutPage /></SuspenseWrapper> },
          { path: 'resources/docs', element: <SuspenseWrapper><DocumentationPage /></SuspenseWrapper> },
          { path: 'resources/api', element: <SuspenseWrapper><ApiReferencePage /></SuspenseWrapper> },
          { path: 'resources/samples', element: <SuspenseWrapper><SampleDatasetsPage /></SuspenseWrapper> },
          { path: 'resources/help', element: <SuspenseWrapper><HelpCenterPage /></SuspenseWrapper> },
          { path: 'demo', element: <SuspenseWrapper><DemoPage /></SuspenseWrapper> },
          { path: 'contact', element: <SuspenseWrapper><ContactPage /></SuspenseWrapper> },
          { path: 'privacy', element: <SuspenseWrapper><PrivacyPolicyPage /></SuspenseWrapper> },
          { path: 'terms', element: <SuspenseWrapper><TermsOfServicePage /></SuspenseWrapper> },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <SuspenseWrapper><LoginPage /></SuspenseWrapper> },
          { path: 'register', element: <SuspenseWrapper><RegisterPage /></SuspenseWrapper> },
          { path: 'forgot-password', element: <SuspenseWrapper><ForgotPasswordPage /></SuspenseWrapper> },
          { path: 'reset-password', element: <SuspenseWrapper><ResetPasswordPage /></SuspenseWrapper> },
        ],
      },
      {
        path: '/app',
        element: <AppLayout />,
        children: [
          { index: true, element: <SuspenseWrapper><DashboardPage /></SuspenseWrapper> },
          { path: 'upload', element: <SuspenseWrapper><UploadPage /></SuspenseWrapper> },
          { path: 'datasets', element: <SuspenseWrapper><DatasetsPage /></SuspenseWrapper> },
          { path: 'datasets/:id', element: <SuspenseWrapper><DatasetDetailPage /></SuspenseWrapper> },
          { path: 'analytics', element: <SuspenseWrapper><AnalyticsPage /></SuspenseWrapper> },
          { path: 'settings', element: <SuspenseWrapper><SettingsPage /></SuspenseWrapper> },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);