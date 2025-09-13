import type { Metadata } from "next";
import "./globals.css";
import { LoginProvider } from "@/app/context/loginProvider";

export const metadata: Metadata = {
  title: "IAPUy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body >
        <LoginProvider>
          {children} 
        </LoginProvider>       
      </body>
    </html>
  );
}
