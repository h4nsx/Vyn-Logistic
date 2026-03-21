import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { MainLayout } from '../layouts/main-layout';
import { AuthLayout } from '../layouts/auth-layout';
import { AppLayout } from '../layouts/app-layout';
import { RootLayout } from '../layouts/root-layout'; 

// Public Pages
import { LoginPage } from '../../pages/public/auth/login.page';
import { RegisterPage } from '../../pages/public/auth/register.page';
import { ForgotPasswordPage } from '../../pages/public/auth/forgot-password.page';
import { ResetPasswordPage } from '../../pages/public/auth/reset-password.page';
import { HomePage } from '../../pages/public/home.page';
import { AboutPage } from '../../pages/public/about.page';
import { ContactPage } from '../../pages/public/contact.page';
import { PrivacyPolicyPage } from '../../pages/public/privacy.page';
import { TermsOfServicePage } from '../../pages/public/terms.page';

// Product Pages
import { HowItWorksPage } from '../../pages/public/products/how-it-works.page';
import { CoreFeaturesPage } from '../../pages/public/products/core-features.page';
import { ArchitecturePage } from '../../pages/public/products/architecture.page';
import { UseCasesPage } from '../../pages/public/products/use-cases.page';

// Resource Pages
import { DocumentationPage } from '../../pages/public/resources/documentation.page';
import { ApiReferencePage } from '../../pages/public/resources/api-reference.page';
import { SampleDatasetsPage } from '../../pages/public/resources/sample-dataset.page';
import { HelpCenterPage } from '../../pages/public/resources/help-center.page';
import { DemoPage } from '../../pages/public/demo.page';

// App (Protected) Pages
import { DashboardPage } from '../../pages/app/dashboard.page';
import { UploadPage } from '../../pages/app/upload.page';
import { DatasetDetailPage } from '../../pages/app/{datasets}/dataset-detail.page';
import { AnalyticsPage } from '../../pages/app/analytics.page';
import { DatasetsPage } from '../../pages/app/{datasets}/datasets.page';
import { SettingsPage } from '../../pages/app/settings.page';

export const router = createBrowserRouter([
  {
    element: <RootLayout />, // Wrap everything in RootLayout
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'products/how-it-works', element: <HowItWorksPage /> },
          { path: 'products/core-features', element: <CoreFeaturesPage /> },
          { path: 'products/architecture', element: <ArchitecturePage /> },
          { path: 'products/use-cases', element: <UseCasesPage /> },
          { path: 'about-us', element: <AboutPage /> },
          { path: 'resources/docs', element: <DocumentationPage /> },
          { path: 'resources/api', element: <ApiReferencePage /> },
          { path: 'resources/samples', element: <SampleDatasetsPage /> },
          { path: 'resources/help', element: <HelpCenterPage /> },
          { path: 'demo', element: <DemoPage /> },
          { path: 'contact', element: <ContactPage /> },
          { path: 'privacy', element: <PrivacyPolicyPage /> },
          { path: 'terms', element: <TermsOfServicePage /> },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
          { path: 'forgot-password', element: <ForgotPasswordPage /> },
          { path: 'reset-password', element: <ResetPasswordPage /> },
        ],
      },
      {
        path: '/app',
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'upload', element: <UploadPage /> },
          { path: 'datasets', element: <DatasetsPage /> },
          { path: 'datasets/:id', element: <DatasetDetailPage /> },
          { path: 'analytics', element: <AnalyticsPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);