import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Menubar from "@/components/menubar";
import Footer from "@/components/footer";
import { Toaster } from "react-hot-toast";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SusunSoal",
  description: "by Kevin Cornellius",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable}  antialiased`}>
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          toastOptions={{
            duration: 4000, // Customize toast duration
            style: {
              background: "#5038bc",
              color: "#fff",
            },
          }}
        />
        <div className="w-full flex flex-col md:flex-row bg-[#fafafa]">
          <Menubar />
          <div className="w-full ml-0 mt-[10vh] md:ml-70 md:mt-0 ">
            {children}
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
