import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'PDD Moldova Admin',
  description: 'Administration panel for PDD Moldova question management',
};

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/questions', label: 'Questions', icon: '❓' },
  { href: '/admin/review', label: 'Review Queue', icon: '📋' },
  { href: '/admin/conflicts', label: 'Conflicts', icon: '⚠️' },
  { href: '/admin/evidence', label: 'Evidence', icon: '📎' },
  { href: '/admin/imports', label: 'Imports', icon: '📥' },
  { href: '/admin/reports', label: 'Reports', icon: '🚩' },
  { href: '/admin/audit', label: 'Audit Log', icon: '📜' },
  { href: '/admin/configs', label: 'Exam Configs', icon: '⚙️' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
            <div className="flex h-16 items-center border-b border-gray-200 px-6">
              <span className="text-xl font-bold text-primary-700">PDD Admin</span>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-700"
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-gray-200 p-4 text-xs text-gray-400">
              v0.1.0 — Oracle Task Manager
            </div>
          </aside>

          {/* Main content */}
          <div className="ml-64 flex flex-1 flex-col">
            <header className="sticky top-0 z-30 flex h-16 items-center border-b border-gray-200 bg-white px-6 shadow-sm">
              <h1 className="text-lg font-semibold text-gray-800">
                PDD Moldova Admin
              </h1>
              <div className="ml-auto flex items-center gap-4">
                <span className="text-sm text-gray-500">Moderator</span>
                <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-sm font-medium text-primary-700">
                  M
                </div>
              </div>
            </header>
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
