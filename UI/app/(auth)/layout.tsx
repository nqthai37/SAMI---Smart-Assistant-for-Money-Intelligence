// filepath: c:\Users\Admin\OneDrive - VNU-HCMUS\University\Năm 2\HK3\SE\Project\Sami\UI\app\(auth)\layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {children}
    </div>
  );
}