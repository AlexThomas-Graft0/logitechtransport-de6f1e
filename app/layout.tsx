import './globals.css';
import { Archivo_Black, JetBrains_Mono } from 'next/font/google';

const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  variable: '--font-display',
  weight: '400',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'logitechtransport',
  description: 'logitechtransport — we are logistic and transport delivery company who operate all over the uk, we use green and yellow a our primary brand colours',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#111111] text-[#F3F4F6] antialiased min-h-screen flex flex-col selection:bg-[#009866] selection:text-white">
        {children}
      </body>
    </html>
  );
}