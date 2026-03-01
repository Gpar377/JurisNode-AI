import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata = {
  title: 'LexLink – AI-Powered Legal Navigation Platform',
  description: 'Navigate any legal situation with confidence. AI-guided procedures, lawyer discovery, and seamless case continuity across jurisdictions.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><ClientLayout>{children}</ClientLayout></body>
    </html>
  );
}
