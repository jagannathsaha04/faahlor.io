import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Faahlor — How good is your eye for color?',
  description: 'A color perception game. Match the target color as closely as you can.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
