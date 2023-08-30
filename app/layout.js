import './globals.css'


export const metadata = {
    title: '四人纸牌-找朋友',
    description: 'Generated by create next app',
    appleWebApp: {},
    icons: {
        icon: ['/logo512x512.png']
    },
    manifest: "/manifest.json",
    viewport: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <link rel="apple-touch-icon" href="/apple-icon.png" />
            <body className="game-body">
                {children}
            </body>
        </html>
    )
}
