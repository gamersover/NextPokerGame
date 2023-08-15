"use client";

import { GameButton, Modal, Toast } from "@/components";
import { GameInfoContext, SetSocketContext, SocketContext, UserInfoContext } from "@/components/GameContext";
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
            setMessage({ msg: `你已在${userInfo.room_number}房间，无法创建其他房间`, key: 0 })
        }
        else {
            const socket = io(SERVER_ADDR, { transports: ['websocket'] })

            socket.on('connect_error', (error) => {
                setMessage({ msg: "服务异常，请稍后重试", key: 0 })
                setTimeout(() => window.location.reload(), 1000)
            });

            socket.emit("create_room", {
                room_number: userInfo.room_number,
                player_name: userInfo.player_name,
                player_avatar: userInfo.player_avatar
            })

            socket.on("create_room", (data) => {
                console.log("收到了create_room消息")
                if (data.status == 1) {
                    const player_id = data.player_id
                    setUserInfo({
                        ...userInfo,
                        room_number: data.game_info.room_number,
                        player_id: player_id,
                        player_name: data.players_info[player_id].player_name,
                    })
                    setGameInfo({
                        ...gameInfo,
                        host_id: data.game_info.host_id,
                        players_info: data.players_info
                    })
                    router.push("/game/room")
                }
                else {
                    setMessage({ msg: data.msg, key: 0 })
                }
            })

            socket.on("join_room_global", (data) => {
                console.log("收到了join_room_global消息")
                if (data.status == 1) {
                    setGameInfo({
                        ...gameInfo,
                        host_id: data.game_info.host_id,
                        players_info: data.players_info
                    })
                }
            })
            setSocket(socket)
        }
    }

    function joinRoom() {
        if (userInfo.room_number !== null) {
            setMessage({ msg: `你已在${userInfo.room_number}房间，无法加入其他房间`, key: 0 })
        }
        else {
            handleJoin()
        }
    }

    return (
        <div className="flex w-8/12 h-5/6 justify-evenly items-center">
            <div className="bg-[url('/fish.svg')] bg-cover bg-center w-1/3 h-5/6 rounded-md flex justify-center items-center shadow-2xl active:scale-90" onClick={joinRoom}>
                <div className="w-11/12 h-full border-cyan-150 flex justify-center items-end">
                    <span className="text-2xl text-blue-200 font-bold mb-2">
                        加入房间
                    </span>
                </div>
            </div>
            <div className="bg-[url('/frog.svg')] bg-cover bg-center w-1/3 h-5/6 rounded-md flex justify-center items-center shadow-2xl active:scale-90" onClick={createRoom}>
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
    const [roomNumber, setRoomNumber] = useState([]) // TODO: 测试用

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
                    <button className="flex items-center justify-center active:scale-95" onClick={handleCloseModal}>
                        <Image src="/close.svg" width={20} height={20} className="w-full" alt=""/>
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
                                <div key={i} className="flex justify-center items-center w-1/6 text-3xl font-bold">
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


function SubstituePlayers({ subsPlayers, subsPlayersID, handleNotJoin, handleSubsJoin }) {
    const [selectedPlayer, setSelectedPlayer] = useState(subsPlayersID[0])
    return (
        <div className="flex flex-col items-center justify-around">
            <div className="w-10/12 flex justify-center items-center">
                {
                    subsPlayersID.length == 1 ? (
                        <span>你加入的游戏已经开始，确认承接该用户的游戏状态？</span>
                    ) : (
                        <span>你加入的游戏已经开始，请选择一个要承接的用户</span>
                    )
                }
            </div>
            <div className="w-full flex justify-evenly">
                {
                    subsPlayersID.map(player_id => (
                        <div key={player_id} className={`${selectedPlayer==player_id ? "bg-white shadow-md" : "bg-white opacity-50"}  p-1 rounded-md flex flex-col items-center`} onClick={() => setSelectedPlayer(player_id)}>
                            <Image
                                src={`/avatars/Avatars Set Flat Style-${String(subsPlayers[player_id].player_avatar).padStart(2, '0')}.png`}
                                width={50}
                                height={50}
                                alt=""
                            />
                            <span>{subsPlayers[player_id].player_name}</span>
                        </div>
                    ))
                }
            </div>
            <div className="w-10/12 flex justify-end">
                <GameButton title={"不加入"} classes="w-16 !h-10 mx-2 font-bold text-red-400" onClick={handleNotJoin}/>
                <GameButton title={"加入"} classes="w-16 !h-10 !rounded-md font-bold text-gray-700 shadow-md bg-blue-300" onClick={() => handleSubsJoin(selectedPlayer)}/>
            </div>
        </div>
    )
}


export default function Home() {
    const [showJoinpop, setShowJoinpop] = useState(false)
    const setSocket = useContext(SetSocketContext)
    const socket = useContext(SocketContext)
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)
    const [message, setMessage] = useState({ msg: null, key: 0 })
    const [subsPlayers, setSubsPlayers] = useState({})
    const [subsPlayersID, setSubsPlayersID] = useState([])
    const [joiningRoomNumber, setJoiningRoomNumber] = useState("")
    const router = useRouter()

    useLayoutEffect(() => {
        setUserInfo(() => ({
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

    function handleNotJoin() {
        setSubsPlayers({})
        setSubsPlayersID([])
    }

    function handleSubsJoin(subsPlayerID) {
        socket.emit("join_room_second", {
            room_number: joiningRoomNumber,
            player_id: subsPlayerID,
            player_name: userInfo.player_name,
            player_avatar: userInfo.player_avatar
        })
    }

    const handleJoinRoom = useCallback((roomNumber) => {
        const socket = io(SERVER_ADDR, {
            transports: ['websocket']
        });

        socket.on('connect_error', (error) => {
            closeModal()
            setMessage({ msg: "服务异常，请稍后重试", key: 0 })
            setTimeout(() => window.location.reload(), 1000)
        });

        socket.emit("join_room", {
            room_number: roomNumber.join(""),
            player_name: userInfo.player_name,
            player_avatar: userInfo.player_avatar
        })

        socket.on("join_room", (data) => {
            console.log("收到了join_room消息")
            if (data.status == 1) {
                const player_id = data.player_id
                setUserInfo({
                    ...userInfo,
                    room_number: data.game_info.room_number,
                    player_id: player_id,
                    player_name: data.players_info[player_id].player_name,
                })
                handleOk()
            }
            else if (data.status == 2) {
                closeModal()
                setSubsPlayers(data.exited_players_info)
                setSubsPlayersID(data.exited_players_id)
                setJoiningRoomNumber(roomNumber.join(""))
            }
            else {
                // closeModal()
                setMessage({msg: `房间${data.game_info.room_number}加入失败，原因${data.msg}`, key: 0})
            }
        })

        socket.on("join_room_global", (data) => {
            console.log("收到了join_room_global消息")
            if (data.status == 1) {
                setGameInfo({
                    ...gameInfo,
                    host_id: data.game_info.host_id,
                    players_info: data.players_info
                })
            }
        })

        socket.on("player_reconnect", data=> {
            console.log("收到了player_reconnect消息")
            if (data.status == 1) {
                setGameInfo(gameInfo => ({
                    ...gameInfo,
                    players_info: data.players_info,
                    state: data.game_info.state,
                    curr_player_id: data.game_info.curr_player_id,
                    friend_card: data.game_info.friend_card,
                    friend_card_cnt: data.game_info.friend_card_cnt,
                    num_games: data.game_info.num_games,
                    host_id: data.game_info.host_id,
                    winners_order: data.game_info.winners_order
                }))
                setUserInfo(userInfo => ({
                    ...userInfo,
                    all_cards: data.user_info.all_cards.map((card, i) => ({ id: i, name: card, showName: card, selected: false })),
                    player_id: data.user_info.player_id,
                    player_name: data.players_info[data.user_info.player_id].player_name,
                    room_number: data.game_info.room_number
                }))
                handleOk()
            }
            else {
                handleNotJoin()
                setMessage(() => ({"msg": `房间${data.game_info.room_number}加入失败，原因：${data.msg}`, key: 0}))
            }
        })
        setSocket(socket)
    }, [userInfo])

    return (
        <div className="flex flex-col justify-evenly items-center h-screen">
            <HomeTitle />
            <HomeButton handleJoin={showModal} setMessage={setMessage} />
            {showJoinpop && (
                <Modal contentStyle="fixed flex rounded-lg justify-center shadow-md top-1/2 left-1/2 bg-white w-[37%] h-[85%] lg:h-[60%] -translate-x-1/2 -translate-y-1/2 z-[100]" backdropStyle='backdrop backdrop-blur-md'>
                    <RoomNumberInput handleJoinRoom={handleJoinRoom} handleCloseModal={closeModal} />
                </Modal>
            )}
            {message.msg && <Toast message={message} duration={4000} />}
            {subsPlayersID.length > 0 && (
                <Modal contentStyle="fixed flex rounded-lg justify-center shadow-md top-1/2 left-1/2 bg-slate-100 w-[37%] h-[85%] md:h-[70%] -translate-x-1/2 -translate-y-1/2 z-[100]" backdropStyle='backdrop backdrop-blur-md'>
                    <SubstituePlayers subsPlayers={subsPlayers} subsPlayersID={subsPlayersID} handleNotJoin={handleNotJoin} handleSubsJoin={handleSubsJoin} />
                </Modal>
            )}
        </div>
    )
}
