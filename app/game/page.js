"use client";

import { GameButton, Modal, Toast } from "@/components";
import { GameInfoContext, SetSocketContext, UserInfoContext } from "@/components/GameContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useLayoutEffect, useState } from "react";
import { io } from "socket.io-client";
import { SERVER_ADDR } from "@/utils/conf";
import Cookies from "js-cookie";

function HomeTitle() {
    return (
        <div className="h-16 flex justify-center items-center">
            <h1 className="font-bold text-3xl">四人纸牌-找朋友</h1>
        </div>
    )
}

function HomeButton({ handleJoin, setMessage }) {
    const setSocket = useContext(SetSocketContext)
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)
    const router = useRouter()

    function createRoom() {
        if (userInfo.room_number !== null) {
            setMessage({msg: `你已在${userInfo.room_number}房间，无法创建其他房间`, key: 0})
        }
        else {
            const socket = io(SERVER_ADDR, { transports: ['websocket'] })
            socket.emit("create_room", {
                room_number: userInfo.room_number,
                player_name: userInfo.player_name,
                player_avatar: userInfo.player_avatar
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
                    setMessage({msg: `服务端错误，创建房间失败。${data.msg}`, key: 0})
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
            setMessage({msg: `你已在${userInfo.room_number}房间，无法加入其他房间`, key: 0})
        }
        else {
            handleJoin()
        }
    }

    return (
        <div className="flex w-8/12 h-5/6 justify-evenly items-center">
            <div className="bg-[url('/fish.svg')] bg-cover w-1/3 h-5/6 rounded-md flex justify-center items-center shadow-2xl active:scale-90" onClick={joinRoom}>
                <div className="w-11/12 h-full border-cyan-150 flex justify-center items-end">
                    <span className="text-2xl text-blue-200 font-bold mb-2">
                        加入房间
                    </span>
                </div>
            </div>
            <div className="bg-[url('/frog.svg')] bg-cover w-1/3 h-5/6 rounded-md flex justify-center items-center shadow-2xl active:scale-90" onClick={createRoom}>
            <div className="w-11/12 h-full border-cyan-150 flex justify-center items-end">
                    <span className="text-2xl text-red-200 font-bold mb-2">
                        创建房间
                    </span>
                </div>
            </div>
        </div>
    )
}


function RoomNumberInput({ handleJoinRoom, handleCloseModal }) {
    const [roomNumber, setRoomNumber] = useState([])

    function handleNumberInput(number) {
        if (roomNumber.length <= 5) {
            setRoomNumber([...roomNumber, number])
        }
    }

    function handleReset() {
        setRoomNumber([])
    }

    function handleDelete() {
        setRoomNumber(roomNumber.slice(0, -1))
    }

    useEffect(() => {
        if (roomNumber.length == 6) {
            handleJoinRoom(roomNumber)
        }
    }, [roomNumber, handleJoinRoom])

    const inputs = [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"]]
    return (
        <div className="flex flex-col justify-center items-center w-full h-full">
            <div className="flex w-full h-[10%]">
                <div className="w-1/12">
                </div>
                <div className="flex flex-1 justify-center items-center">
                    <span className="font-bold text-xl text-red-400">加入房间</span>
                </div>
                <div className="w-1/12 flex justify-center items-center">
                    <button className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-red-300 to-gray-300 shadow-md" onClick={handleCloseModal}>
                        <span className="text-black font-md">&times;</span>
                    </button>
                </div>
            </div>

            <div className="flex justify-center flex-col items-center flex-1 bg-orange-100 rounded-md w-[98%] mb-1">
                <div className="flex justify-center items-center h-[8%]">
                    <span className="text-xs text-zinc-700">请输入6位房间号，在游戏左上角可以找到</span>
                </div>
                <div className="flex justify-center items-center rounded-md h-[18%] w-[90%] bg-stone-300">
                    <div className="flex w-full justify-evenly items-center">
                        {
                            [...roomNumber, ...Array(6 - roomNumber.length).fill("")].map((name, i) => (
                                <div key={i} className="flex justify-center items-center w-1/4 text-lg font-bold">
                                    {name}
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className="flex flex-wrap w-[90%] justify-between items-center flex-1">
                    {inputs[0].map((name, i) => (
                        <GameButton
                            key={i}
                            title={name}
                            classes="w-20 !h-10 !rounded-md text-lg font-bold text-gray-700 shadow-md bg-amber-300"
                            onClick={() => handleNumberInput(name)}
                        />
                    ))}
                    {inputs[1].map((name, i) => (
                        <GameButton
                            key={i}
                            title={name}
                            classes="w-20 !h-10 !rounded-md text-lg font-bold text-gray-700 shadow-md bg-amber-300"
                            onClick={() => handleNumberInput(name)}
                        />
                    ))}
                    {inputs[2].map((name, i) => (
                        <GameButton
                            key={i}
                            title={name}
                            classes="w-20 !h-10 !rounded-md text-lg font-bold text-gray-700 shadow-md bg-amber-300"
                            onClick={() => handleNumberInput(name)}
                        />
                    ))}
                    <GameButton
                        title={"重置"}
                        classes="w-20 !h-10 !rounded-md font-bold text-gray-700 shadow-md bg-blue-300"
                        onClick={handleReset}
                    />
                    <GameButton
                        title={0}
                        classes="w-20 !h-10 !rounded-md text-lg font-bold text-gray-700 shadow-md bg-amber-300"
                        onClick={() => handleNumberInput("0")}
                    />
                    <GameButton
                        title={"删除"}
                        classes="w-20 !h-10 !rounded-md font-bold text-gray-700 shadow-md bg-red-300"
                        onClick={handleDelete}
                    />
                </div>
            </div>
        </div>
    )
}


export default function Home() {
    const [showJoinpop, setShowJoinpop] = useState(false)
    const setSocket = useContext(SetSocketContext)
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)
    const [message, setMessage] = useState({msg: null, key: 0})
    const router = useRouter()

    useLayoutEffect(() => {
        setUserInfo(()=>({
            ...userInfo,
            player_name: Cookies.get("username"),
            player_avatar: Cookies.get("avatarID"),
        }))
    }, [])

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

    const handleJoinRoom = useCallback((roomNumber) => {
        const socket = io(SERVER_ADDR, {
            transports: ['websocket']
        });
        setSocket(socket)
        socket.emit("join_room", {
            room_number: roomNumber.join(""),
            player_name: userInfo.player_name,
            player_avatar: userInfo.player_avatar
        })

        socket.on("join_room", (data) => {
            if (data.status == 1) {
                const player_id = data.player_id
                setUserInfo({
                    ...userInfo,
                    room_number: data.room_info.room_number,
                    player_id: player_id,
                    player_name: data.players_info[player_id].player_name,
                })
                handleOk()
            }
            else {
                setMessage(`房间${data.room_info.room_number}加入失败，原因${data.msg}`)
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
    }, [userInfo])

return (
    <div className="flex flex-col justify-evenly items-center h-screen">
        <HomeTitle />
        <HomeButton handleJoin={showModal} setMessage={setMessage} />
        {showJoinpop && (
            <Modal contentStyle="fixed flex rounded-lg justify-center shadow-md top-1/2 left-1/2 bg-white w-[37%] h-[85%] -translate-x-1/2 -translate-y-1/2 z-[100]" backdropStyle='backdrop backdrop-blur-md'>
                <RoomNumberInput handleJoinRoom={handleJoinRoom} handleCloseModal={closeModal}/>
            </Modal>
        )}
        {message.msg && <Toast message={message} duration={4000}/>}
    </div>
)
}
