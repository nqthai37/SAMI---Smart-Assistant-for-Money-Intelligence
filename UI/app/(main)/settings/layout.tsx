// filepath: c:\Users\Admin\OneDrive - VNU-HCMUS\University\Năm 2\HK3\SE\Project\Sami\UI\app\(main)\layout.tsx
import { Sidebar } from "@/components/ui/sidebar"; // Giả sử bạn có component Sidebar

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}