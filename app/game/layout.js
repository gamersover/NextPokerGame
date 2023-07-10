"use client"

import SocketProvider from "@/components/GameContext";

export default function GameLayout( {children }) {
    return (
        <SocketProvider>
            {children}
        </SocketProvider>
    )
}