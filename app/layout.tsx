import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'KORA Studio',
  description: 'Фінанси, продажі та виробництво KORA',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#24352c',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="uk"><body>{children}</body></html>;
}
