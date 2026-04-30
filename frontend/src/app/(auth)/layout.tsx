export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="min-h-screen relative">
      {/* Simple background for auth pages */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
