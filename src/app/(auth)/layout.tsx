/**
 * Auth layout — minimal layout for login/register pages.
 * No Navbar or MotivationBar.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-gradient)' }}>
      {children}
    </div>
  );
}
