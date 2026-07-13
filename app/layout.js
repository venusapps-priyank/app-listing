export const metadata = {
  title: 'Game List API',
  description: 'Unified app listing API for Android and iOS stores'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
