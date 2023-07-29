"use client";

import { GameButton, RoomNumberInput, Modal } from "@/components";
import { GameInfoContext, SetSocketContext, UserInfoContext } from "@/components/GameContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { io } from "socket.io-client";
import { SERVER_ADDR } from "@/utils/conf";

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
    const setSocket = useContext(SetSocketContext)
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)
    const router = useRouter()

    function createRoom() {
        if (userInfo.room_number !== null) {
            alert(`你已在${userInfo.room_number}房间，无法创建其他房间`)
        }
        else {
            const socket = io(SERVER_ADDR, { transports: ['websocket'] })
            socket.emit("create_room", {
                room_number: userInfo.room_number,
                player_name: userInfo.player_name
            })

            setSocket(socket)

            socket.on("create_room", (data) => {
                if (data.status == 1) {
                    const player_id = data.player_id
                    setUserInfo({
                        ...userInfo,
                        room_number: data.room_info.room_number,
                        player_id: player_id,
                        player_name: data.players_info[player_id].player_name,
                    })
                    setGameInfo({
                        ...gameInfo,
                        host_id: data.room_info.host_id,
                        players_info: data.players_info
                    })
                    router.push("/game/room")
                }
                else {
                    alert(`服务端错误，创建房间失败。${data.msg}`)
                }
            })

            socket.on("join_room_global", (data) => {
                if (data.status == 1) {
                    setGameInfo({
                        ...gameInfo,
                        host_id: data.room_info.host_id,
                        players_info: data.players_info
                    })
                }
            })
        }
    }

    function joinRoom() {
        if (userInfo.room_number !== null) {
            alert(`你已在${userInfo.room_number}房间，无法加入其他房间`)
        }
        else {
            handleJoin()
        }
    }

    return (
        <div className="flex w-1/2 md:w-1/4 justify-between">
            <GameButton
                title="加入房间"
                classes="w-20 bg-cyan-100"
                onClick={joinRoom}
            />
            <GameButton
                title="创建房间"
                classes="w-20 bg-red-100"
                onClick={createRoom}
            />
        </div>
    )
}

export default function Home() {
    const [showJoinpop, setShowJoinpop] = useState(false)
    const router = useRouter()

    function showModal() {
        setShowJoinpop(true)
    }

    function closeModal() {
        setShowJoinpop(false)
    }

    function handleOk() {
        closeModal()
        router.push("/game/room")
    }

    return (
        <div className="flex flex-col justify-evenly items-center h-screen">
            <HomeTitle />
            <HomeImage />
            <HomeButton handleJoin={showModal} />
            {showJoinpop && (
                <Modal contentStyle='join-modal' backdropStyle='backdrop backdrop-blur-md' closeModal={closeModal}>
                    <RoomNumberInput
                        handleOk={handleOk}
                        handleCancel={closeModal}
                    />
                </Modal>
            )}
        </div>
    )
}
