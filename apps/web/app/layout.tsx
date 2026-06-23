import { NavBar } from "@/components/NavBar"
import { ThemeProvider } from "@/components/theme-provider"
import "@workspace/ui/globals.css"
import { cn } from "@workspace/ui/lib/utils"
import { Geist_Mono, Space_Grotesk } from "next/font/google"
import { ConvexClientProvider } from "./ConvexClientProvider"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        spaceGrotesk.variable
      )}
    >
      <link rel="icon" href="/icon.png" sizes="any" />
      <body>
        <ConvexClientProvider>
          <ThemeProvider>
            <NavBar />
            <div className="flex min-h-[calc(100svh-3rem)] flex-col">
              {children}
            </div>
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  )
}
