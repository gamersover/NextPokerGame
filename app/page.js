"use client"

import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <div>
      欢迎登录
      {router.push("/game")}
    </div>
  )
}
