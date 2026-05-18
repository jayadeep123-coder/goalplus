import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "GoalPulse Strategic Tracking",
  description: "Internal goal tracking portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Literata:opsz,wght@7..72,400;7..72,500;7..72,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body className="antialiased font-body-md bg-page-base text-on-surface">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
