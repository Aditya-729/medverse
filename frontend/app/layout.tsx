import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Medverse - Smart Clinical Intake & Hospital Command Center',
  description: 'AI-Powered Patient Intake and Clinical History Platform for Indian Government Hospitals and AYUSH Institutions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-100 text-slate-900 selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
