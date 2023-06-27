"use client";

import { GameButton, JoinModal, BackDrop } from "@/components";
import Image from "next/image";
import { useState } from "react";


function HomeTitle() {
  return (
    <div>
      <h1 className="font-bold text-3xl">四人纸牌-找朋友</h1>
    </div>
  )
}

function HomeImage() {
  return (
    <div>
      <Image src="/logo.webp" alt="logo" width={300} height={300} className="home-logo"></Image>
    </div>
  )
}

function HomeButton({ handleJoin }) {
  function joinHome() {
    handleJoin()
  }

  function creatHome() {

  }

  return (
    <div className="flex w-1/4 justify-between">
      <GameButton
        title="加入房间"
        classes="bg-cyan-100"
        handleClick={joinHome}
      />
      <GameButton
        title="创建房间"
        classes="bg-red-100"
        handleClick={creatHome}
      />
    </div>
  )
}

export default function Home() {

  const [showJoinpop, setShowJoinpop] = useState(false)

  function showModal() {
    setShowJoinpop(true)
  }

  function closeModal() {
    setShowJoinpop(false)
  }

  return (
    <div className="flex flex-col justify-evenly items-center h-screen">
      <HomeTitle />
      <HomeImage />
      <HomeButton handleJoin={showModal} />
      {showJoinpop && <JoinModal handleOk={() => { console.log("ok") }} handleCancel={closeModal} />}
      {showJoinpop && <BackDrop handleClick={closeModal} />}
    </div>
  )
}
