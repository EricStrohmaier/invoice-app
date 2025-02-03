import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { headers } from "next/headers";

import { Header } from "@/components/landingpage/header";
import { createClient } from "@/utils/supabase/server";
import { Provider } from "@/components/Provider";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/landingpage/Foooter";
import { siteConfig } from "@/config/site";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: "Eric Strohmaier",
      url: "https://ericstrohmaier.com",
    },
  ],
  creator: "Eric Strohmaier",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `https://${siteConfig.domain}/`,
    siteName: siteConfig.name,
    images: [
      {
        url: `https://${siteConfig.domain}/icon.png`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "";

  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2706727138311810"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`h-full ${inter.className}`}>
        <Provider>
          <div className="flex flex-col w-full h-full bg-background">
            {pathname !== "/" && <Header user={user as any} />}
            <main className="flex-auto">{children}</main>
          </div>
          <Footer />
          <Toaster richColors theme="light" closeButton />
        </Provider>
      </body>
    </html>
  );
}
