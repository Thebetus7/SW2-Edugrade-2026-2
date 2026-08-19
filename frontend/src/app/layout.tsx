import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/navigation/Navbar';

export const metadata: Metadata = {
  title: 'EduGrade AI - Calificación Inteligente de Exámenes',
  description: 'Sistema multimodal con Google Gemini 2.5 Flash y revisión en tiempo real.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 overflow-auto">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

