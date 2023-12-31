"use client";

import { GameButton, Modal, Toast, BackIcon, TimesIcon } from "@/components";
import { GameInfoContext, SetSocketContext, SocketContext, UserInfoContext } from "@/components/GameContext";
import Image from "next/image";
import { useCallback, useContext, useEffect, useState } from "react";
import { connectSocket, handleSocket } from "@/utils/socketHandler";
import { useLocalStorage } from "@/utils/hooks";
import { rank_raw_cards } from "@/utils/card";

function HomeTitle() {
    return (
        <div className="h-16 flex justify-center items-center">
            <h1 className="font-bold text-3xl">四人纸牌-找朋友</h1>
        </div>
    )
}

function HomeButton({ handleJoin, setNotification, setCurrPage, isCardsOrderReverse }) {
    const socket = useContext(SocketContext)
    const setSocket = useContext(SetSocketContext)
    const [userInfo, setUserInfo, initInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)

    function createRoom() {
        if (userInfo.room_number !== null) {
            setNotification({ msg: `你已在${userInfo.room_number}房间，无法创建其他房间` })
        }
        else {
            console.log("发送create_room消息")
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
                    setCurrPage("room")
                }
                else {
                    setNotification({ msg: data.msg })
                }
            })

            handleSocket(socket, setSocket, setUserInfo, setGameInfo, setNotification, isCardsOrderReverse)
            setSocket(socket)
        }
    }

    function joinRoom() {
        if (userInfo.room_number !== null) {
            setNotification({ msg: `你已在${userInfo.room_number}房间，无法加入其他房间` })
        }
        else {
            handleJoin()
        }
    }

    return (
        <div className="flex w-8/12 h-5/6 justify-evenly items-center">
            <div className="bg-[url('/pokers/fish.svg')] bg-cover bg-center w-1/3 h-5/6 rounded-md flex justify-center items-center shadow-lg dark:shadow-slate-600 active:scale-90" onClick={joinRoom}>
                <div className="w-11/12 h-full border-cyan-150 flex justify-center items-end">
                    <span className="text-2xl text-blue-200 font-bold mb-2">
                        加入房间
                    </span>
                </div>
            </div>
            <div className="bg-[url('/pokers/frog.svg')] bg-cover bg-center w-1/3 h-5/6 rounded-md flex justify-center items-center shadow-lg dark:shadow-slate-600 active:scale-90" onClick={createRoom}>
                <div className="w-11/12 h-full border-cyan-150 flex justify-center items-end">
                    <span className="text-2xl text-red-200 font-bold mb-2">
                        创建房间
                    </span>
                </div>
            </div>
        </div>
    )
}


function RoomNumberInput({ handleJoinRoom, handleCloseModal, setNotification }) {
    const [roomNumber, setRoomNumber] = useState([])
    // const [roomNumber, setRoomNumber] = useState(['0', '0', '0', '0', '0', '0']) TODO: 测试用

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

    function handleCopyed() {
        navigator.clipboard.readText()
            .then(clipboardData => {
                if (/^[0-9]{6}$/.test(clipboardData)) {
                    // 粘贴板中的内容现在存储在 clipboardData 变量中
                    setRoomNumber(clipboardData.split(''))
                }
                else {
                    setNotification({ msg: "非法房间号" })
                }
            })
            .catch(err => {
                console.error('无法读取粘贴板内容：', err);
            });
    }

    useEffect(() => {
        if (roomNumber.length == 6) {
            handleJoinRoom(roomNumber)
        }
    }, [roomNumber, handleJoinRoom])

    const inputs = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "重置", "0", "删除"]
    return (
        <div className="flex flex-col justify-center items-center w-full h-full">
            <div className="flex w-full h-[10%]">
                <div className="w-1/12">
                </div>
                <div className="flex flex-1 justify-center items-center">
                    <span className="font-bold text-xl text-red-400 dark:text-red-500">加入房间</span>
                </div>
                <div className="w-1/12 flex justify-center items-center">
                    <GameButton classes={""} onClick={handleCloseModal}>
                        <TimesIcon className={"w-full h-full dark:fill-white"} />
                    </GameButton>
                </div>
            </div>

            <div className="flex justify-center flex-col items-center flex-1 bg-orange-100 dark:bg-gray-700 rounded-md w-[98%] mb-1">
                <div className="flex justify-center items-center h-[8%]">
                    <span className="text-xs text-zinc-700 dark:text-gray-300">请输入6位房间号（游戏左上角）或点击下方粘贴</span>
                </div>
                <div className="flex justify-center items-center rounded-md h-[18%] w-[90%] bg-stone-300 dark:bg-neutral-500" onPointerDown={handleCopyed}>
                    <div className="grid grid-cols-6 w-full place-items-center">
                        {roomNumber.map((name, i) => (
                            <span key={i} className="text-3xl font-bold">{name}</span>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3 w-[90%] my-2 flex-1">
                    {inputs.map((name, i) => {
                        if (name === '重置') {
                            return (
                                <GameButton
                                    key={i}
                                    classes='!w-full !h-full !rounded-md text-lg font-bold text-gray-700 shadow-md bg-blue-300 dark:text-white dark:bg-blue-800'
                                    onClick={handleReset}
                                >
                                    {name}
                                </GameButton>
                            )
                        }
                        else if (name === '删除') {
                            return (
                                <GameButton
                                    key={i}
                                    classes='!w-full !h-full !rounded-md text-lg font-bold text-gray-700 shadow-md bg-red-300 dark:text-white dark:bg-red-800'
                                    onClick={handleDelete}
                                >
                                    {name}
                                </GameButton>
                            )
                        }
                        else {
                            return (
                                <GameButton
                                    key={i}
                                    classes="!w-full !h-full !rounded-md text-lg font-bold text-gray-700 shadow-md bg-amber-300 dark:text-white dark:bg-amber-600"
                                    onClick={() => handleNumberInput(name)}
                                >
                                    {name}
                                </GameButton>
                            )
                        }
                    })}
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
                        <div key={player_id} className={`${selectedPlayer == player_id ? "shadow-md" : "opacity-50"} w-20 bg-white dark:bg-gray-500 p-1 rounded-md flex flex-col items-center justify-center`} onClick={() => setSelectedPlayer(player_id)}>
                            <Image
                                src={subsPlayers[player_id].player_avatar}
                                width={50}
                                height={50}
                                alt=""
                            />
                            <span className="w-full text-center text-ellipsis whitespace-nowrap overflow-hidden">{subsPlayers[player_id].player_name}</span>
                        </div>
                    ))
                }
            </div>
            <div className="w-10/12 flex justify-end">
                <GameButton classes="w-16 !h-10 mx-2 font-bold text-red-400 dark:text-red-500" onClick={handleNotJoin}>不加入</GameButton>
                <GameButton classes="w-16 !h-10 !rounded-md font-bold text-gray-700 dark:text-white shadow-md bg-blue-300 dark:bg-blue-700" onClick={() => handleSubsJoin(selectedPlayer)}>加入</GameButton>
            </div>
        </div>
    )
}


export default function Game({ setCurrPage, handleBack }) {
    const [showJoinpop, setShowJoinpop] = useState(false)
    const setSocket = useContext(SetSocketContext)
    const socket = useContext(SocketContext)
    const [userInfo, setUserInfo, initInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)
    const [notification, setNotification] = useState({ msg: null, key: 0 })
    const [subsPlayers, setSubsPlayers] = useState({})
    const [subsPlayersID, setSubsPlayersID] = useState([])
    const [joiningRoomNumber, setJoiningRoomNumber] = useState("")
    const [connectStatus, setConnectStatus] = useState(false)

    const [playerName, setPlayerName] = useLocalStorage("player_name", userInfo.player_name)
    const [playerAvatar, setPlayerAvatar] = useLocalStorage("player_avatar", userInfo.player_avatar)
    const [isCardsOrderReverse, setIsCardsOrderReverse] = useLocalStorage("cardsOrderReverse", false)

    useEffect(() => {
        connectSocket(setConnectStatus, setSocket)
    }, [])

    useEffect(() => {
        setUserInfo({
            ...userInfo,
            player_name: playerName,
            player_avatar: playerAvatar
        })
    }, [playerName, playerAvatar])


    function showModal() {
        setShowJoinpop(true)
    }

    function closeModal() {
        setShowJoinpop(false)
    }

    function handleOk() {
        closeModal()
        setCurrPage("room")
    }

    function handleNotJoin() {
        setSubsPlayers({})
        setSubsPlayersID([])
    }

    function handleSubsJoin(subsPlayerID) {
        console.log("发送join_room_second消息")
        socket.emit("join_room_second", {
            room_number: joiningRoomNumber,
            player_id: subsPlayerID,
            player_name: userInfo.player_name,
            player_avatar: userInfo.player_avatar
        })
    }

    const handleJoinRoom = useCallback((roomNumber) => {
        console.log("发送join_room消息")
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
                setGameInfo({
                    ...gameInfo,
                    messages: data.game_info.messages
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
                setNotification({ msg: `加入房间失败，${data.msg}` })
            }
        })

        socket.on("player_reconnect", data => {
            console.log("收到了player_reconnect消息")
            if (data.status == 1) {
                const all_cards = rank_raw_cards(data.user_info.all_cards, isCardsOrderReverse)
                setGameInfo((gameInfo) => ({
                    ...gameInfo,
                    players_info: data.players_info,
                    state: data.game_info.state,
                    curr_player_id: data.game_info.curr_player_id,
                    friend_card: data.game_info.friend_card,
                    friend_card_cnt: data.game_info.friend_card_cnt,
                    num_games: data.game_info.num_games,
                    host_id: data.game_info.host_id,
                    winners_order: data.game_info.winners_order,
                    messages: data.game_info.messages
                }))
                setUserInfo((userInfo) => ({
                    ...userInfo,
                    all_cards: all_cards.map((card, i) => ({ id: i + 1, name: card, showName: card, selected: false, isFriendCard: card.split("-").slice(0, 1)[0] == data.game_info.friend_card })),
                    player_id: data.user_info.player_id,
                    player_name: data.players_info[data.user_info.player_id].player_name,
                    room_number: data.game_info.room_number
                }))
                handleOk()
            }
            else {
                handleNotJoin()
                setNotification(() => ({ "msg": `房间${data.game_info.room_number}加入失败，原因：${data.msg}` }))
            }
        })

        handleSocket(socket, setSocket, setUserInfo, setGameInfo, setNotification, isCardsOrderReverse)
        setSocket(socket)
    }, [socket, userInfo])

    return (
        <div className="flex flex-col justify-evenly items-center h-screen">
            <div className="fixed flex items-center top-3 left-4">
                <GameButton classes={"!h-8 !w-8"} onClick={handleBack}>
                    <BackIcon className={"h-full w-full dark:fill-white"} />
                </GameButton>
            </div>
            <div className="fixed flex items-center w-32 bg-opacity-10 h-10 top-2 right-2">
                {
                    connectStatus ?
                        (
                            <>
                                <span className="inline-block mr-1 bg-green-400 animate-pulse w-2 h-2 rounded-full"></span>
                                服务正常
                            </>
                        )
                        : (
                            <>
                                <span className="inline-block mr-1 bg-red-400 animate-pulse w-2 h-2 rounded-full"></span>
                                服务连接中...
                            </>
                        )}
            </div>
            <HomeTitle />
            <HomeButton handleJoin={showModal} setNotification={setNotification} setCurrPage={setCurrPage} isCardsOrderReverse={isCardsOrderReverse}/>
            {showJoinpop && (
                <Modal contentStyle="fixed flex rounded-lg justify-center shadow-md top-1/2 left-1/2 bg-white dark:bg-neutral-800 min-w-[300px] max-h-[500px] w-[37%] h-[80%] lg:h-[60%] -translate-x-1/2 -translate-y-1/2 z-[100]" backdropStyle='backdrop backdrop-blur-md'>
                    <RoomNumberInput handleJoinRoom={handleJoinRoom} handleCloseModal={closeModal} setNotification={setNotification} />
                </Modal>
            )}
            {notification.msg && <Toast message={notification} duration={4000} color={"error"} />}
            {subsPlayersID.length > 0 && (
                <Modal contentStyle="fixed flex rounded-lg justify-center shadow-md top-1/2 left-1/2 bg-slate-100 dark:bg-neutral-700 w-[37%] h-[85%] md:h-[70%] -translate-x-1/2 -translate-y-1/2 z-[100]" backdropStyle='backdrop backdrop-blur-md'>
                    <SubstituePlayers subsPlayers={subsPlayers} subsPlayersID={subsPlayersID} handleNotJoin={handleNotJoin} handleSubsJoin={handleSubsJoin} />
                </Modal>
            )}
        </div>
    )
}
