import { Navbar } from '@/components/layout/Navbar';
import { MotivationBar } from '@/components/layout/MotivationBar';
import { OfflineBanner } from '@/components/layout/OfflineBanner';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

/**
 * Main app layout — wraps all module pages.
 * Includes: OfflineBanner, Navbar, MotivationBar, SettingsPanel.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <OfflineBanner />
      <Navbar />
      <MotivationBar />
      <main className="flex-1">
        {children}
      </main>
      <SettingsPanel />
    </div>
  );
}
