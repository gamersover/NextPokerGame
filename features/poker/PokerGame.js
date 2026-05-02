"use client";

import { AddIcon, BackDrop, BackIcon, GameButton, Modal, TimesIcon, Toast, UserSettingIcon } from "@/components";
import { GameInfoContext, SetSocketContext, SocketContext, UserInfoContext } from "@/features/poker/context/PokerContext";
import Image from "next/image";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { connectSocket, handleSocket } from "@/features/poker/lib/socket";
import { useLocalStorage } from "@/utils/hooks";
import { rank_raw_cards } from "@/features/poker/lib/cards";

function HomeTitle() {
    return (
        <div className="h-16 flex justify-center items-center">
            <h1 className="font-bold text-3xl">四人纸牌-找朋友</h1>
        </div>
    )
}

function UserSettingPanel({
    avatar,
    username,
    handleUserNameChanged,
    handleAvatarSelected,
    showAvatars,
    handleShowAvatars,
    themeOption,
    setThemeOption,
    isCardsOrderReverse,
    setIsCardsOrderReverse,
    isMusicOn,
    setIsMusicOn,
    dragHandleProps
}) {
    const imageList = Array.from(new Array(50)).map((_, index) => {
        return `/avatars/Avatars Set Flat Style-${String(index + 1).padStart(2, "0")}.png`
    })
    const [showInputError, setShowInputError] = useState(false)
    const [avatars, setAvatars] = useState(imageList)
    const fileInputRef = useRef(null)

    function handleInputChanged(e) {
        const userName = e.target.value
        const sanitizedValue = userName.replace(/[\u4e00-\u9fa5]/g, "__")
        if (sanitizedValue.length <= 20) {
            handleUserNameChanged(userName)
            setShowInputError(false)
        }
        else {
            setShowInputError(true)
        }
    }

    function handleFileSelect(e) {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = function (event) {
                const img = new window.Image()
                img.src = event.target.result
                img.onload = function () {
                    const canvas = document.createElement("canvas")
                    const ctx = canvas.getContext("2d")
                    const maxSize = 192
                    let width = img.width
                    let height = img.height

                    if (width > maxSize || height > maxSize) {
                        const aspectRatio = width / height
                        if (width > height) {
                            width = maxSize
                            height = maxSize / aspectRatio
                        }
                        else {
                            height = maxSize
                            width = maxSize * aspectRatio
                        }
                    }

                    canvas.width = width
                    canvas.height = height
                    ctx.drawImage(img, 0, 0, width, height)
                    setAvatars([canvas.toDataURL("image/jpeg"), ...avatars])
                }
            }
            reader.readAsDataURL(file)
        }
    }

    function triggleFileInput() {
        fileInputRef.current.click()
    }

    return (
        <div className="flex max-h-full w-full flex-col items-center px-4 pb-5 pt-3 sm:h-full sm:px-0 sm:pb-6 sm:pt-14">
            <button
                type="button"
                aria-label="下滑关闭设置"
                {...dragHandleProps}
                className="mb-3 flex h-7 w-full touch-none cursor-grab items-center justify-center active:cursor-grabbing sm:hidden"
            >
                <span className="h-1.5 w-10 rounded-full bg-slate-300" />
            </button>
            <div className="flex w-full flex-col gap-5 overflow-hidden overflow-y-auto">
                <div className="flex w-full flex-col gap-2 px-1 sm:px-3">
                    <p className="px-4 text-xs font-bold text-slate-500">用户设置</p>
                    <div className="overflow-hidden rounded-2xl bg-white dark:bg-neutral-900">
                        <div className="flex min-h-[56px] w-full items-center justify-between px-4">
                            <p className="font-medium text-slate-950 dark:text-white">头像</p>
                            <button type="button" className={`flex h-9 w-9 items-center justify-center rounded-full border ${avatar ? "border-slate-100" : "border-red-300"}`} onClick={handleShowAvatars}>
                                {avatar ? (
                                    <Image width={100} height={100} alt="" src={avatar} className="h-full w-full rounded-full bg-slate-100" />
                                ) : <AddIcon className="h-4 w-4 stroke-red-400 dark:stroke-white" />}
                            </button>
                        </div>
                        <div className="ml-4 flex min-h-[56px] w-[calc(100%-1rem)] items-center justify-between border-t border-slate-200 pr-4 dark:border-neutral-800">
                            <p className="font-medium text-slate-950 dark:text-white">用户名</p>
                            <div className="flex w-32 flex-col items-end justify-center">
                                <input
                                    type="text"
                                    placeholder="请输入用户名"
                                    value={username}
                                    onChange={handleInputChanged}
                                    className={`w-full bg-transparent text-right text-slate-500 focus:outline-none dark:text-slate-300 ${showInputError || username === "" ? "placeholder:text-red-400" : ""}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex w-full flex-col gap-2 px-1 sm:px-3">
                    <p className="px-4 text-xs font-bold text-slate-500">游戏设置</p>
                    <div className="overflow-hidden rounded-2xl bg-white dark:bg-neutral-900">
                        <div className="flex min-h-[56px] w-full items-center justify-between px-4">
                            <p className="font-medium text-slate-950 dark:text-white">音乐</p>
                            <label className="relative inline-flex items-center">
                                <input type="checkbox" className="peer sr-only" checked={isMusicOn} onChange={() => setIsMusicOn(!isMusicOn)} />
                                <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-700 dark:border-gray-600"></div>
                            </label>
                        </div>
                        <div className="ml-4 flex min-h-[56px] w-[calc(100%-1rem)] items-center justify-between border-t border-slate-200 pr-4 dark:border-neutral-800">
                            <div className="font-medium text-slate-950 dark:text-white">牌序（从大到小）</div>
                            <label className="relative inline-flex items-center">
                                <input type="checkbox" className="peer sr-only" checked={isCardsOrderReverse} onChange={() => setIsCardsOrderReverse(!isCardsOrderReverse)} />
                                <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-700 dark:border-gray-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
                <div className="flex w-full flex-col gap-2 px-1 sm:px-3">
                    <p className="px-4 text-xs font-bold text-slate-500">主题设置</p>
                    <div className="overflow-hidden rounded-2xl bg-white dark:bg-neutral-900">
                        {[
                            ["light", "普通模式"],
                            ["dark", "暗黑模式"],
                            ["follow", "跟随系统"],
                        ].map(([value, label], index) => (
                            <label key={value} className={`ml-4 flex min-h-[52px] items-center ${index > 0 ? "border-t border-slate-200 dark:border-neutral-800" : ""}`}>
                                <input type="radio" className="h-5 w-5" value={value} checked={themeOption === value} onChange={(e) => setThemeOption(e.target.value)} />
                                <span className={`ml-3 text-slate-950 dark:text-white ${themeOption === value ? "font-bold" : ""}`}>{label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            {showAvatars && (
                <Modal contentStyle="fixed flex flex-col items-center rounded-lg justify-center shadow-md top-0 h-full left-0 bg-white dark:bg-neutral-900 w-full z-[100]" backdropStyle="">
                    <div className="flex h-[15%] items-center text-xl">头像选择</div>
                    <div className="mb-5 flex w-11/12 flex-1 flex-wrap items-center justify-center overflow-y-auto border-y-[1px] border-slate-100 shadow-inner dark:border-gray-600 dark:shadow-slate-800">
                        <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" ref={fileInputRef} />
                        <div className="m-4">
                            <GameButton classes="!h-14 !w-14 !rounded-full border-2" onClick={triggleFileInput}>
                                <AddIcon className="h-1/2 w-1/2 stroke-black dark:stroke-white" />
                            </GameButton>
                        </div>
                        {avatars.map((path, i) => (
                            <div key={i + 1} className="m-4" onClick={() => handleAvatarSelected(path)}>
                                <Image src={path} width={100} height={100} alt="" className="h-14 w-14" />
                            </div>
                        ))}
                    </div>
                </Modal>
            )}
        </div>
    )
}

function HomeButton({ handleJoin, handleShowUserPanel, setNotification, setCurrPage, isCardsOrderReverse }) {
    const socket = useContext(SocketContext)
    const setSocket = useContext(SetSocketContext)
    const [userInfo, setUserInfo, initInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)
    const needsUserProfile = !userInfo.player_name || !userInfo.player_avatar

    function createRoom() {
        if (needsUserProfile) {
            handleShowUserPanel()
            setNotification({ msg: "请先设置头像和用户名" })
            return
        }
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
        if (needsUserProfile) {
            handleShowUserPanel()
            setNotification({ msg: "请先设置头像和用户名" })
            return
        }
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


export default function Game({ setCurrPage, handleBack, themeOption, setThemeOption, isMusicOn, setIsMusicOn }) {
    const [showJoinpop, setShowJoinpop] = useState(false)
    const [showUserPanel, setShowUserPanel] = useState(false)
    const [isUserPanelOpening, setIsUserPanelOpening] = useState(false)
    const [isUserPanelClosing, setIsUserPanelClosing] = useState(false)
    const [isUserPanelDragClosing, setIsUserPanelDragClosing] = useState(false)
    const [isUserPanelDragging, setIsUserPanelDragging] = useState(false)
    const [isUserPanelSettling, setIsUserPanelSettling] = useState(false)
    const [userPanelDragOffset, setUserPanelDragOffset] = useState(0)
    const [showAvatars, setShowAvatars] = useState(false)
    const userPanelDragRef = useRef({ startY: 0, lastY: 0, lastTime: 0, velocity: 0, offset: 0 })
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
    }, [setSocket])

    useEffect(() => {
        setUserInfo((userInfo) => ({
            ...userInfo,
            player_name: playerName,
            player_avatar: playerAvatar
        }))
    }, [playerName, playerAvatar, setUserInfo])


    function showModal() {
        setShowJoinpop(true)
    }

    function closeModal() {
        setShowJoinpop(false)
    }

    function handleShowUserPanel() {
        setIsUserPanelOpening(true)
        setIsUserPanelClosing(false)
        setIsUserPanelDragClosing(false)
        setIsUserPanelDragging(false)
        setIsUserPanelSettling(false)
        setUserPanelDragOffset(0)
        setShowUserPanel(true)
        setTimeout(() => {
            setIsUserPanelOpening(false)
        }, 350)
    }

    function handleCloseUserPanel(fromDrag = false) {
        if (isUserPanelClosing || isUserPanelDragClosing) {
            return
        }

        if (fromDrag) {
            setIsUserPanelDragClosing(true)
            setIsUserPanelDragging(false)
            setIsUserPanelSettling(true)
            setUserPanelDragOffset(typeof window === "undefined" ? 720 : window.innerHeight)
            setShowAvatars(false)
            setTimeout(() => {
                setShowUserPanel(false)
                setIsUserPanelDragClosing(false)
                setIsUserPanelSettling(false)
                setUserPanelDragOffset(0)
            }, 260)
            return
        }

        setIsUserPanelClosing(true)
        setIsUserPanelOpening(false)
        setIsUserPanelDragging(false)
        setIsUserPanelSettling(false)
        setUserPanelDragOffset(0)
        setShowAvatars(false)
        setTimeout(() => {
            setShowUserPanel(false)
            setIsUserPanelClosing(false)
            setUserPanelDragOffset(0)
        }, 280)
    }

    function handleShowAvatars() {
        setShowAvatars(true)
    }

    function handleCloseAvatars() {
        setShowAvatars(false)
    }

    function handleAvatarSelected(path) {
        handleCloseAvatars()
        setPlayerAvatar(path)
    }

    function handleUserPanelDragStart(event) {
        if (isUserPanelClosing) {
            return
        }

        event.currentTarget.setPointerCapture?.(event.pointerId)
        const now = performance.now()
        userPanelDragRef.current = {
            startY: event.clientY,
            lastY: event.clientY,
            lastTime: now,
            velocity: 0,
            offset: 0,
        }
        setIsUserPanelSettling(false)
        setIsUserPanelDragging(true)
    }

    function handleUserPanelDragMove(event) {
        if (!isUserPanelDragging || isUserPanelClosing) {
            return
        }

        const drag = userPanelDragRef.current
        const now = performance.now()
        const timeDelta = Math.max(now - drag.lastTime, 1)
        drag.velocity = (event.clientY - drag.lastY) / timeDelta
        drag.lastY = event.clientY
        drag.lastTime = now

        const rawOffset = event.clientY - drag.startY
        const resistedOffset = rawOffset < 0 ? Math.max(rawOffset * 0.22, -28) : rawOffset
        drag.offset = resistedOffset
        setUserPanelDragOffset(resistedOffset)
    }

    function handleUserPanelDragEnd() {
        if (!isUserPanelDragging) {
            return
        }

        const shouldClose = userPanelDragRef.current.offset > 96 || userPanelDragRef.current.velocity > 0.72
        setIsUserPanelDragging(false)

        if (shouldClose) {
            handleCloseUserPanel(true)
            return
        }

        setIsUserPanelSettling(true)
        setUserPanelDragOffset(0)
        setTimeout(() => {
            setIsUserPanelSettling(false)
        }, 220)
    }

    const handleOk = useCallback(() => {
        closeModal()
        setCurrPage("room")
    }, [setCurrPage])

    const handleNotJoin = useCallback(() => {
        setSubsPlayers({})
        setSubsPlayersID([])
    }, [])

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
                setUserInfo((userInfo) => ({
                    ...userInfo,
                    room_number: data.game_info.room_number,
                    player_id: player_id,
                    player_name: data.players_info[player_id].player_name,
                }))
                setGameInfo((gameInfo) => ({
                    ...gameInfo,
                    messages: data.game_info.messages
                }))
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
    }, [handleNotJoin, handleOk, isCardsOrderReverse, setGameInfo, setSocket, setUserInfo, socket, userInfo])

    const userPanelDragStyle = (isUserPanelDragClosing || (!isUserPanelClosing && (isUserPanelDragging || isUserPanelSettling)))
        ? {
            transform: `translateY(${userPanelDragOffset}px)`,
            transition: isUserPanelDragging ? "none" : `transform ${isUserPanelDragClosing ? 260 : 220}ms cubic-bezier(.2, .9, .2, 1)`,
        }
        : undefined
    const isUserPanelGestureActive = isUserPanelDragging || isUserPanelSettling || isUserPanelDragClosing
    const userPanelAnimationClass = isUserPanelGestureActive
        ? ""
        : isUserPanelClosing
            ? "settings-sheet-out"
            : isUserPanelOpening
                ? "settings-sheet-in"
                : ""

    return (
        <div className="flex flex-col justify-evenly items-center h-screen">
            <div className="fixed flex items-center top-3 left-4">
                <GameButton classes={"!h-8 !w-8"} onClick={handleBack}>
                    <BackIcon className={"h-full w-full dark:fill-white"} />
                </GameButton>
            </div>
            <div className="fixed left-16 top-3">
                <GameButton classes={"!h-8 !w-8"} onClick={showAvatars ? handleCloseAvatars : handleShowUserPanel}>
                    <UserSettingIcon className="h-full w-full fill-slate-700 dark:fill-white" />
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
            <HomeButton handleJoin={showModal} handleShowUserPanel={handleShowUserPanel} setNotification={setNotification} setCurrPage={setCurrPage} isCardsOrderReverse={isCardsOrderReverse}/>
            {showUserPanel && (
                <>
                    <div
                        className={`${userPanelAnimationClass} fixed inset-x-0 bottom-0 z-[100] flex max-h-[76dvh] items-start justify-center rounded-t-[30px] bg-[#F2F2F7]/95 shadow-[0_-18px_44px_rgba(15,23,42,.18)] backdrop-blur-xl dark:bg-neutral-950/95 dark:shadow-slate-300 sm:bottom-auto sm:left-auto sm:right-0 sm:top-0 sm:h-full sm:max-h-none sm:w-[30%] sm:items-start sm:rounded-none sm:bg-gray-100 sm:shadow-md sm:dark:bg-black`}
                        style={userPanelDragStyle}
                    >
                        <div className="pointer-events-none absolute inset-x-0 -bottom-40 h-40 bg-[#F2F2F7]/95 dark:bg-neutral-950/95 sm:hidden" />
                        <button
                            type="button"
                            title="关闭设置"
                            onClick={showAvatars ? handleCloseAvatars : () => handleCloseUserPanel()}
                            className="absolute right-4 top-4 z-[101] flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-slate-700 shadow-sm transition hover:bg-white hover:text-slate-950 active:scale-95 dark:bg-neutral-800/90 dark:text-white"
                        >
                            <TimesIcon className="h-4 w-4 fill-current" />
                        </button>
                        <UserSettingPanel
                            avatar={playerAvatar}
                            username={playerName}
                            handleUserNameChanged={setPlayerName}
                            handleAvatarSelected={handleAvatarSelected}
                            showAvatars={showAvatars}
                            handleShowAvatars={handleShowAvatars}
                            themeOption={themeOption}
                            setThemeOption={setThemeOption}
                            isCardsOrderReverse={isCardsOrderReverse}
                            setIsCardsOrderReverse={setIsCardsOrderReverse}
                            isMusicOn={isMusicOn}
                            setIsMusicOn={setIsMusicOn}
                            dragHandleProps={{
                                onPointerDown: handleUserPanelDragStart,
                                onPointerMove: handleUserPanelDragMove,
                                onPointerUp: handleUserPanelDragEnd,
                                onPointerCancel: handleUserPanelDragEnd,
                            }}
                        />
                    </div>
                    <BackDrop classes="backdrop backdrop-brightness-50" onClick={() => handleCloseUserPanel()} />
                </>
            )}
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
