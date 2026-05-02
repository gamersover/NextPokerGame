import './globals.css'


export const metadata = {
    title: '游戏大厅',
    description: '选择纸牌或同步方块开始游玩',
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
            {children}
        </html>
    )
}
