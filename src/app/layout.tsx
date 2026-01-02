import "./globals.css";
import { Inter, Noto_Nastaliq_Urdu } from "next/font/google";
import { SessionProvider } from "next-auth/react";

export const metadata = {
  title: "Herbal Khana",
  description: "E-commerce platform for herbal products",
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});
const notoUrdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"], // Urdu uses Arabic script subset
  weight: ["400"],
  display: "swap",
});
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware handles redirects - just show/hide navbar
  return (
    <html lang="en" className={`${inter.className} ${notoUrdu.className}`}>
      <body suppressHydrationWarning>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
