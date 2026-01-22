import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="min-h-screen bg-white text-gray-900 flex flex-col">
        {children}
      </body>
    </html>
  );
}