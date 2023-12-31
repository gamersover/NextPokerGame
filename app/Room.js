"use client";

import { CardsPanel, CircleContent, CloseIcon, TimesIcon, GameButton, InfoIcon, Modal, Toast, LogoutIcon, MessageIcon, CopyIcon, CheckedIcon } from '@/components';
import { GameInfoContext, SocketContext, UserInfoContext } from '@/components/GameContext';
import { GameState, PlayerState } from '@/utils/tool';
import Image from 'next/image';
import { useContext, useState, useEffect, useMemo, useRef } from 'react';
import { SPECIAL_CARDS, is_valid_out_cards, rank_raw_cards } from '@/utils/card';
import { OutState } from '@/utils/card';
import { useLocalStorage } from '@/utils/hooks';


function GameAvater({ imgUrl, playerState, playerTeam, playerRank, size = "sm", alt = '' }) {
    const sizeType = {
        "sm": "w-10 h-10",
        "md": "w-12 h-12",
    }

    const opacityValue = useMemo(() => {
        return playerState < PlayerState.Prepared || playerState == PlayerState.PlayerEnd ? 'opacity-60' : 'opacity-100'
    }, [playerState])

    const actived = useMemo(() => {
        return playerState == PlayerState.RoundStart
    }, [playerState])

    const border_color = useMemo(() => {
        if (playerTeam) {
            return playerTeam === 'red' ? 'border-red-500' : 'border-blue-500'
        }
        else {
            return "border-white"
        }
    }, [playerTeam])

    return (
        <div className={`relative flex ${actived ? "animate-bounce" : ''}`}>
            <Image src={imgUrl} width={50} height={50} alt={alt} className={`rounded-full shadow-md ${border_color} border-2 ${sizeType[size]} ${opacityValue}`} />
            {playerRank && <div className='absolute -bottom-0 -right-1 text-sm rounded-full shadow-md h-4 w-4 flex justify-center items-center bg-red-500 text-slate-100'>{playerRank}</div>}
        </div>
    )
}


function ScoreContent({ playerScore }) {
    const scoreContent = (
        <>
            <span className="text-yellow-600 dark:text-yellow-400">{playerScore ? playerScore : '0'}</span>
        </>
    )
    return (
        <CircleContent circleTitle={"分"} titleBgColor={'bg-cyan-100 dark:bg-cyan-900'} circleSize="small" contentSize="small">
            {scoreContent}
        </CircleContent>
    )
}


function GameBasicInfo({ playerName, playerAvatar, playerState, playerTeam, playerRank, finalScore }) {
    return (
        <div className="flex flex-col w-14 items-center justify-between rounded-t-full rounded-md bg-white dark:bg-neutral-500 bg-opacity-30">
            <GameAvater imgUrl={playerAvatar} playerState={playerState} playerTeam={playerTeam} playerRank={playerRank} />
            <div className="flex justify-center items-center h-4 text-xs w-[90%] my-1">
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">{playerName || '无名称'}</span>
            </div>
            <ScoreContent playerScore={finalScore} />
        </div>
    )
}

function ValueCards({ shouldShowAll, valueCards, resetShowValueCardsPlayerId}) {
    const [showAll, setShowAll] = useState(false)

    function handleShowAll() {
        setShowAll(true)
    }

    function closeShowAll() {
        setShowAll(false)
        resetShowValueCardsPlayerId()
    }

    const last_value_cards = useMemo(() => {
        return valueCards[valueCards.length - 1]
    }, [valueCards])

    const showAllFinal = useMemo(() => {
        return shouldShowAll || showAll
    }, [shouldShowAll, showAll])

    return (
        <>
            <div className="flex flex-col shadow-md" onClick={handleShowAll}>
                {last_value_cards && (
                    last_value_cards.slice(-1).map((card, i) => (
                        <Image key={i} src={`/pokers/${card}.svg`} width={20} height={20} alt='' className="w-7" />
                    ))
                )}
            </div>
            {showAllFinal && (
                <Modal contentStyle={`fixed flex rounded-lg justify-center shadow-md left-1/2 top-1/2 bg-slate-300/80 dark:bg-neutral-900/80 w-1/2 h-1/2 -translate-x-1/2 -translate-y-1/2 ${showAllFinal ? 'z-[90]' : 'z-[60]'}`} backdropStyle={`backdrop ${showAllFinal ? '!z-[89]' : '!z-[59]'} backdrop-blur-md`} onClose={closeShowAll}>
                    <div className='w-full h-full flex flex-col justify-between items-center'>
                        <div className="flex w-full h-[18%] items-center justify-center pr-1">
                            <div className="flex-1"></div>
                            <div className="flex justify-center w-2/3">
                                <span className="text-lg">赏牌</span>
                            </div>
                            <div className="flex justify-end items-center flex-1">
                                <GameButton onClick={closeShowAll} classes={"w-8 h-8"}>
                                    <TimesIcon className={"w-full h-full dark:fill-white"} />
                                </GameButton>
                            </div>
                        </div>
                        <div className='flex flex-wrap justify-center items-center w-[95%] flex-1'>
                            {valueCards.map((cards, i) => (
                                <div className="mx-1" key={i} >
                                    <CardsPanel cards={cards.map((card) => ({ showName: card }))} size="small"/>
                                </div>
                            ))}
                        </div>
                    </div>
                </Modal>
            )}
        </>

    )
}


function GameCardInfo({ num_cards, value_cards, playerState, shouldShowAll, resetShowValueCardsPlayerId }) {
    return (
        <div className="flex flex-col justify-between flex-1">
            <div className="h-1/2 flex justify-center items-center">
                {playerState >= PlayerState.GameStart && (
                    <div className="w-full h-full bg-[url('/pokers/red.svg')] bg-center bg-contain bg-no-repeat flex justify-center items-center">
                        <span className="text-white font-medium">{num_cards != null ? num_cards : '?'}</span>
                    </div>
                )}
            </div>
            <div className="flex h-1/2 justify-center items-center">
                <ValueCards shouldShowAll={shouldShowAll} valueCards={value_cards} resetShowValueCardsPlayerId={resetShowValueCardsPlayerId}/>
            </div>
        </div>
    )
}

function PlayerOut({ style, state, valid_cards, is_exited, friend_card }) {
    const content = useMemo(() => {
        let content = null;
        if (is_exited) {
            content = <span>重连中...</span>
        }
        else {
            if (state == PlayerState.Prepared) {
                content = <span>已准备</span>
            }
            else if (state == PlayerState.RoundSkip) {
                content = <span>跳过</span>
            }
            else if (state == PlayerState.RoundStart) {
                content = <span>出牌中...</span>
            }
            else {
                content = valid_cards && <CardsPanel cards={valid_cards.map(card => ({ showName: card, isFriendCard: card.split("-").slice(0, 1)[0] == friend_card }))} size='small'/>
            }
        }
        return content
    }, [state, valid_cards, friend_card, is_exited])

    return (
        <div className={`w-1/3 flex flex-col relative ${style}`}>
            {content}
        </div>
    )
}

function GameCardsOut({ right, left, top, friend_card, isReverse }) {
    return (
        <>
            <PlayerOut
                style={'justify-center items-start mr-1'}
                state={left ? left.state : null}
                valid_cards={left && left.valid_cards ? rank_raw_cards(left.valid_cards, isReverse) : []}
                is_exited={left ? left.is_exited == 1 : 0}
                friend_card={friend_card}
            />
            <PlayerOut
                style={'justify-start items-center mr-1'}
                state={top ? top.state : null}
                valid_cards={top && top.valid_cards ? rank_raw_cards(top.valid_cards, isReverse) : []}
                is_exited={top ? top.is_exited == 1 : 0}
                friend_card={friend_card}
            />
            <PlayerOut
                style={'justify-center items-end'}
                state={right ? right.state : null}
                valid_cards={right && right.valid_cards ? rank_raw_cards(right.valid_cards, isReverse) : []}
                is_exited={right ? right.is_exited == 1 : 0}
                friend_card={friend_card}
            />
        </>
    )
}


function PlayerExitModal({ setIsShowExit, setCurrPage, handleExit }) {
    function handleCancel() {
        setIsShowExit(false)
    }

    return (
        <Modal contentStyle="fixed shadow-lg flex flex-col justify-center items-center top-1/2 left-1/2 w-1/2 h-1/2 -translate-x-1/2 -translate-y-1/2 z-[100]" backdropStyle="backdrop backdrop-brightness-75 !z-[99]">
            <div className="flex rounded-lg h-full w-full flex-col justify-around items-center bg-gradient-to-br dark:from-neutral-700 dark:via-neutral-700 dark:to-neutral-700 from-red-100 via-red-50 to-red-100">
                <div className="w-11/12 text-red-500 dark:text-red-600 h-1/3 text-xl font-bold flex items-center">
                    ❗️用户离线
                </div>
                <div className="w-10/12 text-md h-1/3">
                    房间其他用户已断开连接，等待重连中...
                </div>
                <div className="w-10/12 flex items-center justify-end h-1/3">
                    <div className="flex items-center gap-3">
                        <GameButton classes="bg-red-400 dark:bg-red-900 text-gray-100 dark:text-gray-300 !h-10 w-24 !font-normal" onClick={handleExit}>退出房间</GameButton>
                        <GameButton classes="bg-blue-400 dark:bg-blue-900 text-white dark:text-gray-100 !h-10 w-24 !font-normal" onClick={handleCancel}>继续等待</GameButton>
                    </div>
                </div>
            </div>
        </Modal>
    )
}


function MessagePanel({ closePanel, sendMessage, messages, handleShowLast }) {
    const [message, setMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const messageContentRef = useRef(null)

    const preserveMessages = [
        "你牌打得也忒好了",
        "搞快点 搞快点",
        "快点啊，等得我花都谢了"
    ]

    function handleInputChanged(e) {
        setMessage(e.target.value)
    }

    function handleSendMessage() {
        if (message.length > 0) {
            setIsSending(true)
            sendMessage(message)
            setMessage('')

            setTimeout(() => {
                setIsSending(false)
            }, 500)
        }
    }

    useEffect(() => {
        handleShowLast(messageContentRef)
    }, [handleShowLast, message])

    return (
        <Modal contentStyle="fixed flex flex-col px-2 top-12 right-28 w-5/12 h-[60%] lg:h-1/3 bg-slate-700/50 dark:bg-neutral-900/80 rounded-lg text-sm text-white z-[50]" backdropStyle="backdrop !z-[49]" onClose={closePanel}>
            <div className='h-full flex flex-col'>
                <div className='flex-grow flex-col mb-1 border-red-100 overflow-hidden overflow-y-auto' style={{ WebkitOverflowScrolling: 'touch' }} ref={messageContentRef}>
                    {
                        messages.map((msg, i) => {
                            return (
                                <div key={i} className='flex items-center dark:border-gray-300 border-b-[1px] h-10'>
                                    <span className='text-green-400 dark:text-green-700'>{msg.player_name}：</span>
                                    <span className='dark:text-gray-300'>{msg.msg}</span>
                                </div>
                            )
                        })
                    }
                    <div className='flex justify-center text-gray-300 dark:text-gray-400 items-center pt-1 h-5'>无更多消息</div>
                </div>
                <div className='flex flex-col justify-center items-end mb-1 w-full'>
                    <div className='flex w-full mb-1 gap-1'>
                        {preserveMessages.map((msg, i) => {
                            return (
                            <GameButton key={i} classes='bg-red-100 dark:bg-red-950 dark:text-gray-100 !h-auto !w-auto !rounded-md !p-1 !font-normal text-gray-600 !text-xs' onClick={() => { setMessage(msg) }}>
                                {msg}
                            </GameButton>)
                        })}
                    </div>
                    <div className='flex justify-center items-end w-full'>
                        <div className='flex w-full justify-between'>
                            <input
                                className='pl-2 mr-2 flex-1 rounded-md text-black border-[1px] dark:border-gray-300 focus:border-red-200 focus:dark:border-red-500 focus:outline-none dark:bg-neutral-500 dark:text-white'
                                placeholder='输入聊天内容'
                                value={message}
                                onChange={handleInputChanged}
                                maxLength={20}
                            />
                            <GameButton shouldDisable={isSending} classes={`${isSending ? 'bg-gray-300 text-gray-700 opacity-50' : 'bg-red-300 dark:bg-red-900 dark:text-white text-black'}`} onClick={handleSendMessage}>
                                发送
                            </GameButton>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

function RoomNumberCard({ roomNumber }) {
    const [isCopyed, setIsCopyed] = useState(false)

    function copyRoomNumber() {
        if (!isCopyed) {
            setIsCopyed(true)
            navigator.clipboard.writeText(roomNumber)
            setTimeout(() => {
                setIsCopyed(false)
            }, 2000)
        }
    }

    return (
        <>
            {roomNumber}
            <GameButton onClick={copyRoomNumber} classes={"active:!transform-none"}>
                {isCopyed ? <CheckedIcon className={"h-5 w-5 stroke-black dark:stroke-white"} /> : <CopyIcon className={"h-5 w-5 dark:fill-white"} />}
            </GameButton>
        </>
    )
}


function GameHeader({ height, showValueCardsPlayerId, resetShowValueCardsPlayerId, setCurrPage }) {
    const [userInfo, setUserInfo, initInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)
    const [newMessageCnt, setNewMessageCnt] = useState(0)
    const socket = useContext(SocketContext)
    const [isShowMessage, setIsShowMessage] = useState(false)


    const player_id = useMemo(() => {
        return (parseInt(userInfo.player_id) + 2) % 4
    }, [userInfo.player_id])

    const player_info = useMemo(() => {
        let player_info = null
        if (gameInfo.players_info) {
            player_info = gameInfo.players_info[player_id]
        }
        return player_info
    }, [player_id, gameInfo.players_info])

    const friend_card = useMemo(() => {
        return gameInfo.friend_card && (
            <div className="flex items-center justify-around w-full">
                <Image
                    width={20}
                    height={20}
                    alt=""
                    src={`/pokers/${gameInfo.friend_card}_small.svg`}
                    className="w-7"
                />
                <TimesIcon className={"w-5 h-5 dark:fill-white"} />
                <span className="text-violet-800 dark:text-violet-400 font-bold text-lg">{gameInfo.friend_card_cnt}</span>
            </div>
        )
    }, [gameInfo.friend_card, gameInfo.friend_card_cnt])

    function sendMessage(newMessage) {
        socket.emit("send_message", {
            player_name: userInfo.player_name,
            msg: newMessage
        })
    }

    function handleShowMessage() {
        setIsShowMessage(true)
        setNewMessageCnt(0)
    }

    useEffect(() => {
        socket.on("send_message_global", (data) => {
            setGameInfo((gameInfo) => ({
                ...gameInfo,
                messages: [...gameInfo.messages, data]
            }))

            if (!isShowMessage) {
                setNewMessageCnt((newMessageCnt) => newMessageCnt + 1)
            }
        })
        return () => {
            socket.off("send_message_global")
        }
    }, [isShowMessage])

    function handleShowLast(ref) {
        if (isShowMessage) {
            if (ref.current) {
                ref.current.scrollTop = ref.current.scrollHeight
            }
        }
    }

    function handleExit() {
        socket.emit("exit")
        initInfo()
        setCurrPage("game")
    }

    return (
        <div className={`flex mt-1 px-5 pt-1 w-screen items-start justify-between ${height}`}>
            <div className="flex w-[30%] justify-start gap-2">
                <CircleContent circleTitle={'房'} circleChild={<RoomNumberCard roomNumber={userInfo.room_number} />} titleBgColor={'bg-cyan-100 dark:bg-cyan-900'}>
                    <RoomNumberCard roomNumber={userInfo.room_number} />
                </CircleContent>
                <CircleContent circleTitle={'朋'} titleBgColor={'bg-red-100 dark:bg-red-900'}>
                    {friend_card}
                </CircleContent>
            </div>
            <div className="flex flex-1 justify-center">
                <div className="flex w-24">
                    {player_info && (
                        <>
                            <GameBasicInfo
                                playerName={player_info.player_name}
                                playerAvatar={player_info.player_avatar}
                                playerState={player_info.state}
                                playerTeam={player_info.team}
                                playerRank={player_info.rank}
                                finalScore={player_info.global_score}
                            />
                            <GameCardInfo
                                num_cards={player_info.num_cards}
                                value_cards={player_info.show_value_cards || []}
                                playerState={player_info.state}
                                shouldShowAll={showValueCardsPlayerId == player_id}
                                resetShowValueCardsPlayerId={resetShowValueCardsPlayerId}
                            />
                        </>
                    )}
                </div>
            </div>
            <div className='w-[30%] h-10 flex justify-end'>
                <GameButton classes={`${isShowMessage ? "bg-red-300 dark:bg-red-900" : "bg-white dark:bg-neutral-800"} relative !w-20 !h-full border-2 border-red-300 dark:border-red-900 mr-2`} onClick={handleShowMessage}>
                    <div className='flex justify-center gap-1 items-center'>
                        <MessageIcon className={"h-5 w-5 dark:fill-white"} />
                        <span>消息</span>
                    </div>
                    {newMessageCnt > 0 && <span className='absolute -top-2 -right-2 bg-red-500 dark:bg-red-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-sm'>{newMessageCnt}</span>}
                </GameButton>
                <GameButton classes={'bg-white !w-20 !h-full border-2 border-lime-500 dark:border-lime-900 dark:bg-neutral-800'} onClick={handleExit}>
                    <div className='flex justify-center gap-1 items-center'>
                        <LogoutIcon className={"h-5 w-5 dark:fill-white"} />
                        <span>退出</span>
                    </div>
                </GameButton>
            </div>
            {isShowMessage && <MessagePanel closePanel={() => setIsShowMessage(false)} sendMessage={sendMessage} messages={gameInfo.messages} handleShowLast={handleShowLast} />}
        </div>
    )
}

function GameNeck({ height, showValueCardsPlayerId, resetShowValueCardsPlayerId, isCardsOrderReverse }) {
    const [userInfo, setUserInfo, initInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)

    const [left_player_id, right_player_id, top_player_id] = useMemo(() => {
        const my_player_id = parseInt(userInfo.player_id)
        const right_player_id = (my_player_id + 1) % 4
        const top_player_id = (my_player_id + 2) % 4
        const left_player_id = (my_player_id + 3) % 4
        return [left_player_id, right_player_id, top_player_id]
    }, [userInfo.player_id])

    const [left_player_info, right_player_info, top_player_info] = useMemo(() => {
        let left_player_info = null, right_player_info = null, top_player_info = null
        if (gameInfo.players_info) {
            left_player_info = gameInfo.players_info[left_player_id]
            right_player_info = gameInfo.players_info[right_player_id]
            top_player_info = gameInfo.players_info[top_player_id]
        }

        return [left_player_info, right_player_info, top_player_info]
    }, [gameInfo.players_info, left_player_id, right_player_id, top_player_id])


    return (
        <div className={`flex justify-between items-center w-full px-2 ${height}`}>
            <div className="flex w-24 ml-7">
                {left_player_info && (
                    <>
                        <GameBasicInfo
                            playerName={left_player_info.player_name}
                            playerAvatar={left_player_info.player_avatar}
                            playerState={left_player_info.state}
                            playerTeam={left_player_info.team}
                            playerRank={left_player_info.rank}
                            finalScore={left_player_info.global_score}
                        />
                        <GameCardInfo
                            num_cards={left_player_info.num_cards}
                            value_cards={left_player_info.show_value_cards || []}
                            playerState={left_player_info.state}
                            shouldShowAll={showValueCardsPlayerId == left_player_id}
                            resetShowValueCardsPlayerId={resetShowValueCardsPlayerId}
                        />
                    </>
                )}
            </div>
            <div className="flex-1 h-full mx-1 flex pt-2">
                <GameCardsOut
                    left={left_player_info}
                    right={right_player_info}
                    top={top_player_info}
                    friend_card={gameInfo.friend_card}
                    isReverse={isCardsOrderReverse}
                />
            </div>
            <div className="flex w-24 mr-7">
                {right_player_info && (
                    <>
                        <GameCardInfo
                            num_cards={right_player_info.num_cards}
                            value_cards={right_player_info.show_value_cards || []}
                            playerState={right_player_info.state}
                            shouldShowAll={showValueCardsPlayerId == right_player_id}
                            resetShowValueCardsPlayerId={resetShowValueCardsPlayerId}
                        />
                        <GameBasicInfo
                            playerName={right_player_info.player_name}
                            playerAvatar={right_player_info.player_avatar}
                            playerState={right_player_info.state}
                            playerTeam={right_player_info.team}
                            playerRank={right_player_info.rank}
                            finalScore={right_player_info.global_score}
                        />
                    </>
                )}
            </div>
        </div>
    )
}


function GameMain({ height, showValueCardsPlayerId, resetShowValueCardsPlayerId, setCurrPage, isCardsOrderReverse }) {
    const [userInfo, setUserInfo, initInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)
    const [notification, setNotification] = useState({ msg: null })
    const socket = useContext(SocketContext)
    const [selectAll, setSelectAll] = useState(false)
    const [isMouseDown, setIsMouseDown] = useState(false)
    const [isShowExit, setIsShowExit] = useState(false)

    function handlePrepare() {
        if (gameInfo.players_info[userInfo.player_id].state >= PlayerState.Prepared) {
            setNotification(() => ({ msg: "已准备" }))
        }
        else {
            console.log("发送prepare_start消息")
            socket.emit("prepare_start", {})
        }
    }

    function handleGo() {
        if (gameInfo.players_info[userInfo.player_id].state === PlayerState.RoundStart) {
            const selectedCard = userInfo.all_cards.filter(card => card.selected).map(card => card.showName)
            if (selectedCard.length == 0) {
                setNotification(() => ({ msg: "未选择任何牌" }))
                return
            }

            let result = is_valid_out_cards(
                selectedCard,
                false,
                gameInfo.last_valid_cards_info,
                gameInfo.is_start,
            )


            // TODO: 方便快速测试
            // if (selectedCard.length >= 21) {
            //     result = {
            //         status: 1,
            //         raw_cards: [],
            //         cards_info: [],
            //         cards_value: 0
            //     }
            // }

            if (result.status === -1 || result.status === 0) {
                setNotification(() => ({ msg: result.msg }))
            }
            else if (result.status === 1) {
                const all_cards = userInfo.all_cards.filter(card => !card.selected)
                setUserInfo({
                    ...userInfo,
                    all_cards: all_cards,
                    state: PlayerState.GameStart,
                    out_cards: userInfo.all_cards.filter(card => card.selected)
                })
                console.log("发送game_step消息")
                socket.emit("game_step", {
                    raw_out_cards: selectedCard,
                    raw_cards: result.raw_cards,
                    cards_info: result.cards_info,
                    cards_value: result.cards_value,
                    all_cards: all_cards.map(card => card.name),
                    out_state: OutState.VALID,
                })

            }
        }
        else {
            setNotification(() => ({ msg: "非出牌时间" }))
        }
    }

    function handlePass() {
        if (gameInfo.players_info[userInfo.player_id].state === PlayerState.RoundStart) {
            const result = is_valid_out_cards(
                null,
                true,
                gameInfo.last_valid_cards_info,
                gameInfo.is_start,
            )
            if (result.status === 2) {
                // 所有选中的牌的状态重置为未选中
                const all_cards = userInfo.all_cards.map(card => ({
                    ...card,
                    selected: false
                }))
                setUserInfo({
                    ...userInfo,
                    all_cards: all_cards,
                    state: PlayerState.RoundSkip,
                    out_cards: []
                })
                console.log("发送game_step消息")
                socket.emit("game_step", {
                    out_state: OutState.PASS,
                })
            }
            else if (result.status === -1) {
                setNotification(() => ({ msg: "无法跳过，请选择出牌" }))
            }
        }
        else {
            setNotification(() => ({ msg: "非出牌时间" }))
        }
    }

    function handleSelectAll() {
        const all_cards = userInfo.all_cards.map(card => ({
            ...card,
            selected: !selectAll
        }))
        setSelectAll(!selectAll)
        setUserInfo({
            ...userInfo,
            all_cards: all_cards
        })
    }

    function handleCardSelect(id) {
        const all_cards = [...userInfo.all_cards]
        all_cards[id].selected = !all_cards[id].selected
        setUserInfo({
            ...userInfo,
            all_cards: all_cards
        })
    }

    function handleMouseDown(id) {
        handleCardSelect(id)
        setIsMouseDown(true)
    }

    function handleMouseEnter(id) {
        if (isMouseDown) {
            handleCardSelect(id)
        }
    }

    function handleMouseUp() {
        setIsMouseDown(false)
    }

    function handleNextRound() {
        setUserInfo({
            ...userInfo,
            all_cards: [],
            out_cards: []
        })
        console.log("发送next_round消息")
        socket.emit("next_round")
    }

    useEffect(() => {
        if (gameInfo.state == GameState.GameStop) {
            setIsShowExit(true)
        }
        else {
            setIsShowExit(false)
        }
    }, [gameInfo.state, gameInfo.exited_player_id])

    function handleExit() {
        socket.emit("exit")
        initInfo()
        setCurrPage("game")
    }

    const firendHelpToast = useMemo(() => {
        if (gameInfo.friend_help_info && gameInfo.friend_help_info.is_friend_help) {
            return (
                <Toast
                    message={{
                        msg: (<>
                            朋友牌效果触发，
                            {<span className='font-bold'>{gameInfo.players_info[gameInfo.friend_help_info.player].player_name} </span>}
                            保护了
                            {<span className='font-bold'> {gameInfo.players_info[gameInfo.friend_help_info.helped_friend].player_name} </span>}
                        </>)
                    }}
                    color="primary"
                    duration={6000}
                />)
        }
        else {
            return null
        }
    }, [gameInfo.friend_help_info, gameInfo.players_info])

    const player_info = gameInfo.players_info ? gameInfo.players_info[userInfo.player_id] : {}
    let content = null
    let render_out_cards = []
    if (player_info.valid_cards) {
        render_out_cards = rank_raw_cards(player_info.valid_cards, isCardsOrderReverse)
        render_out_cards = render_out_cards.map(card => ({ showName: card, isFriendCard: card.split("-").slice(0, 1)[0] == gameInfo.friend_card }))
    }
    else {
        render_out_cards = userInfo.out_cards
    }

    switch (player_info.state) {
        case PlayerState.InGame:
            content = <GameButton classes={"bg-red-200 bg-red-200 border-[1px] border-red-400 dark:bg-red-700 dark:border-red-300"} onClick={handlePrepare}>准备</GameButton>
            break
        case PlayerState.Prepared:
            content = <span>已准备</span>
            break
        case PlayerState.RoundStart:
            content = (
                <div className="flex gap-3 justify-between">
                    <GameButton classes={"bg-gray-100 border-[1px] border-gray-400 dark:bg-gray-900 dark:border-gray-300"} onClick={handleSelectAll}>全选</GameButton>
                    <GameButton classes={"bg-red-200 border-[1px] border-red-400 dark:bg-red-900 dark:border-red-300"} onClick={handlePass}>跳过</GameButton>
                    <GameButton classes={"bg-blue-300 border-[1px] border-blue-400 dark:bg-blue-900 dark:border-blue-300"} onClick={handleGo}>出牌</GameButton>
                </div>
            )
            break
        case PlayerState.GameStart:
            content = (
                <CardsPanel cards={render_out_cards} size="small"/>
            )
            break
        case PlayerState.RoundSkip:
            content = <span>跳过</span>
            break
        case PlayerState.PlayerEnd:
            content = <CardsPanel cards={render_out_cards} size="small"/>
            break
        case PlayerState.GameEnd:
            content = <GameButton classes={"w-20 bg-red-200 border-[1px] border-red-400 dark:bg-red-900"} onClick={handleNextRound}>再来一局</GameButton>
            break
        default:
            content = null
    }

    return (
        <div className={`flex ${height} w-screen justify-center mb-6`}>
            <div className="flex flex-1">
            </div>
            <div className="flex flex-col items-center w-10/12">
                <div className="flex w-full h-[40%] justify-center items-center relative">
                    {content}
                </div>
                <div className="flex flex-1 justify-center items-end mb-2 w-screen">
                    {userInfo.all_cards.length > 0 && (
                        <CardsPanel
                            cards={userInfo.all_cards}
                            handleMouseDown={handleMouseDown}
                            handleMouseUp={handleMouseUp}
                            handleMouseEnter={handleMouseEnter}
                        />
                    )}
                </div>
            </div>
            <div className="flex flex-1 justify-center items-end mb-1">
                <ValueCards shouldShowAll={showValueCardsPlayerId == userInfo.player_id} valueCards={player_info.show_value_cards || []} resetShowValueCardsPlayerId={resetShowValueCardsPlayerId} />
            </div>
            {notification.msg && <Toast message={notification} duration={4000} color="error" />}
            {isShowExit && (
                <PlayerExitModal setIsShowExit={setIsShowExit} setCurrPage={setCurrPage} handleExit={handleExit} />
            )}
            {firendHelpToast}
        </div>
    )
}

function NumberSelectPanel({ selectedNumber, onNumberSelected }) {
    const numbers = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2', null]
    return (
        <div className='w-[90%] h-[90%] grid grid-cols-4 gap-3'>
            {numbers.map((number, i) => (
                <GameButton
                    key={i}
                    classes={`${number ? 'col-span-1' : 'col-span-3'} !w-full !h-full !rounded-md text-gray-700 dark:text-white ${number == selectedNumber ? 'shadow-inner bg-amber-100 dark:bg-[#342e0b]' : 'shadow-md dark:bg-[#655413] bg-amber-300'}`}
                    onClick={() => onNumberSelected(number)}
                >
                    {number ? number : "重置"}
                </GameButton>)
            )}
        </div>
    )
}

function SubstituteJokerCards({ jokerCards, selectedCard, handleCardChange }) {
    return (
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 place-items-center">
            {jokerCards.map(card => (
                <label key={card.id}>
                    <input
                        type="radio"
                        className="hidden"
                        value={card.id}
                        checked={selectedCard.id === card.id}
                        onChange={() => handleCardChange(card)}
                    />
                    <Image
                        src={`/pokers/${card.showName}.svg`}
                        width={50}
                        height={50}
                        alt=""
                        className={`w-12 my-1 ${selectedCard.id === card.id ? 'opacity-100 shadow-md' : 'opacity-50'}`}
                    />
                </label>
            ))}
        </div>
    )
}

function JokerSubstituter({ jokerCards, handleJokerSubstitute, handleCloseModal }) {
    function getCardShowNumber(card) {
        if (card.showName.split('-').length > 0) {
            return card.showName.split('-')[1]
        }
        else {
            return null
        }
    }

    const [selectedCard, setSelectedCard] = useState(jokerCards[0])
    const [selectedNumber, setSelectedNumber] = useState(getCardShowNumber(jokerCards[0]))

    const handleCardChange = (card) => {
        setSelectedCard(card)
        setSelectedNumber(getCardShowNumber(card))
    }

    const handleNumberSelected = (number) => {
        setSelectedNumber(number)
        handleJokerSubstitute(selectedCard.id, number)
    }

    return (
        <div className="flex flex-col justify-center h-full w-full">
            <div className="flex w-full flex-1 items-center justify-center pr-1">
                <div className="flex-1"></div>
                <div className="flex justify-center w-2/3">
                    <span className="text-lg font-bold">替换王牌</span>
                </div>
                <div className="flex justify-end items-center flex-1">
                    <button className="flex items-center justify-end w-7 h-7" onClick={handleCloseModal}>
                        <TimesIcon className={"w-full h-full dark:fill-white"} />
                    </button>
                </div>
            </div>
            <div className="flex justify-evenly w-full items-center h-[85%] pb-1">
                <div className="flex justify-center w-1/2 h-full m-1 items-center bg-amber-50 dark:bg-yellow-800/40 rounded-md">
                    <SubstituteJokerCards jokerCards={jokerCards} selectedCard={selectedCard} handleCardChange={handleCardChange} handleCloseModal={handleCloseModal} />
                </div>
                <div className="flex justify-center w-1/2 h-full mr-1 items-center bg-amber-50 dark:bg-yellow-800/40 rounded-md">
                    <NumberSelectPanel selectedNumber={selectedNumber} onNumberSelected={handleNumberSelected} />
                </div>
            </div>
        </div>
    )
}

function GameFooter({ setShowValueCardsPlayerId }) {
    const [userInfo, setUserInfo, initInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)
    const [showJokerSubs, setShowJokerSubs] = useState(false)
    const [showEndModal, setShowEndModal] = useState(false)

    const player_info = useMemo(() => {
        return gameInfo.players_info ? gameInfo.players_info[userInfo.player_id] : {}
    }, [gameInfo.players_info, userInfo.player_id])

    const selected_joker_cards = useMemo(() => {
        return userInfo.all_cards.filter(card => card.selected && SPECIAL_CARDS.has(card.name))
    }, [userInfo.all_cards])

    const game_result = useMemo(() => {
        let game_result = []
        if (player_info.state == PlayerState.GameEnd) {
            for (let i of gameInfo.winners_order) {
                game_result.push({
                    player_id: i,
                    player_avatar: gameInfo.players_info[i].player_avatar,
                    player_name: gameInfo.players_info[i].player_name,
                    normal_score: gameInfo.players_info[i].normal_score,
                    value_score: gameInfo.players_info[i].value_score,
                    final_score: gameInfo.players_info[i].final_score,
                    global_score: gameInfo.players_info[i].global_score
                })
            }
        }
        return game_result
    }, [player_info.state, gameInfo.winners_order, gameInfo.players_info])


    useEffect(() => {
        setShowEndModal(player_info.state == PlayerState.GameEnd)
    }, [player_info.state])

    function handleShowJokerSubstitute() {
        setShowJokerSubs(true)
    }

    function handleCloseModal() {
        setShowJokerSubs(false)
    }

    function handleshowEndModal() {
        setShowEndModal(true)
    }

    function hanleColseEndModal() {
        setShowEndModal(false)
    }

    function handleJokerSubstitute(substituteJokerId, substitutedCard) {
        const all_cards = userInfo.all_cards.map(card => {
            if (card.id === substituteJokerId) {
                return {
                    ...card,
                    showName: substitutedCard ? `${card.name}-${substitutedCard}` : card.name
                }
            }
            else {
                return card
            }
        })
        setUserInfo({
            ...userInfo,
            all_cards: all_cards
        })
    }

    return (
        <>
            <div className=" bg-transparent/10 dark:bg-black w-screen h-7 fixed left-0 bottom-0 z-0"></div>
            <div className="fixed bottom-0 flex w-screen px-5 z-10 h-7">
                <div className="flex w-full h-full items-center justify-between">
                    <div className="flex h-full gap-3 items-center">
                        <div className='self-end'>
                            <GameAvater imgUrl={player_info.player_avatar} playerState={player_info.state} playerTeam={player_info.team} playerRank={player_info.rank} size='md' />
                        </div>
                        <CircleContent circleTitle={"名"} titleBgColor={'bg-cyan-100 dark:bg-cyan-900'} circleSize={"small"}>
                            <span className='whitespace-nowrap text-ellipsis overflow-hidden'>{userInfo.player_name}</span>
                        </CircleContent>
                        <ScoreContent playerScore={player_info.global_score} />
                    </div>
                    <div className="flex w-1/6 items-center gap-2 justify-center mr-4">
                        {selected_joker_cards.length > 0 && (
                            <GameButton
                                onClick={handleShowJokerSubstitute}
                                classes="!rounded-md shadow-md text-gray-600 text-sm !h-6 !w-full bg-amber-200 dark:bg-[#655413] dark:text-white"
                            >
                                替换王牌
                            </GameButton>
                        )}
                        {player_info.state == PlayerState.GameEnd && (
                            <GameButton
                                onClick={handleshowEndModal}
                                classes="!rounded-md shadow-md text-gray-600 text-sm !h-6 !w-full bg-indigo-300 dark:bg-indigo-700 dark:text-white"
                            >
                                显示结果
                            </GameButton>
                        )}

                    </div>
                </div>
            </div>
            {showJokerSubs && (
                <Modal contentStyle="fixed flex rounded-lg justify-center shadow-md top-[40%] left-1/2 bg-slate-100/40 dark:bg-neutral-600/40 backdrop-blur-sm h-56 w-96 -translate-x-1/2 -translate-y-1/2 z-[70]" backdropStyle="backdrop !z-[69] backdrop-brightness-75">
                    <JokerSubstituter jokerCards={selected_joker_cards} handleJokerSubstitute={handleJokerSubstitute} handleCloseModal={handleCloseModal} />
                </Modal>
            )}
            {showEndModal && (
                <Modal contentStyle="fixed flex flex-col justify-center top-1/2 left-1/2 w-1/2 h-[60%] lg:h-[40%] -translate-x-1/2 -translate-y-1/2 z-[80]" backdropStyle="backdrop !z-[79] backdrop-brightness-[40%]">
                    <div className="flex flex-col h-full rounded-lg bg-zinc-200/80 dark:bg-zinc-800/80 backdrop-blur-sm justify-center items-center w-full">
                        <div className="flex w-full h-[10%]">
                            <div className="w-1/4"></div>
                            <div className="flex-1 flex justify-center">
                                <span className=" text-gray-800 dark:text-gray-200 font-extrabold -mt-4 text-3xl">结算</span>
                            </div>
                            <div className='w-1/4 flex justify-end'>
                                <GameButton onClick={hanleColseEndModal} classes="!w-8 !h-8">
                                    <TimesIcon className={"w-full h-full dark:fill-white"} />
                                </GameButton>
                            </div>
                        </div>
                        <div className="flex flex-col justify-evenly flex-1 w-5/6">
                            <div className="flex w-full">
                                <span className="flex flex-1"></span>
                                {["昵称", "输赢", "赏值", "分数", "总分"].map(title => (
                                    <span key={title} className="flex w-[18%] justify-center text-amber-500 dark:text-amber-300 font-bold">{title}</span>
                                ))}
                            </div>
                            {game_result.map(
                                player => (
                                    <div key={player.player_id} className={`flex w-full text-blue-800 dark:text-blue-300 py-1 ${player.player_id == userInfo.player_id ? "bg-blue-100/80 dark:bg-neutral-700/80 rounded-md font-bold" : ""}`}>
                                        <div className='flex flex-1 justify-end items-center'>
                                            <Image src={player.player_avatar} width={30} height={30} alt="" className="w-6 h-6 mr-1 rounded-full" />
                                        </div>
                                        <div className={`flex w-[18%] justify-center items-center`}>
                                            <span className="overflow-hidden text-ellipsis whitespace-nowrap">{player.player_name}</span>
                                        </div>
                                        <div className={`flex w-[18%] justify-center items-center`}>
                                            <span className={`rounded-xl w-2/3 flex items-center justify-center ${player.normal_score > 0 ? 'bg-emerald-300 dark:bg-emerald-700' : (player.normal_score < 0 ? 'bg-rose-300 dark:bg-rose-800' : '')}`}>{player.normal_score}</span>
                                        </div>
                                        <div className={`flex w-[18%] justify-center items-center`}>
                                            {player.value_score}
                                            {player.value_score > 0 && (
                                                <GameButton classes={"!w-5 h-full p-0"} onClick={() => setShowValueCardsPlayerId(player.player_id)}>
                                                    <InfoIcon className={"w-full h-full dark:fill-white"} />
                                                </GameButton>)
                                            }
                                        </div>
                                        <div className={`flex w-[18%] justify-center items-center`}>
                                            <span className={`rounded-xl w-2/3 flex items-center justify-center ${player.final_score > 0 ? 'bg-emerald-300 dark:bg-emerald-700' : (player.final_score < 0 ? 'bg-rose-300 dark:bg-rose-800' : '')}`}>{player.final_score}</span>
                                        </div>
                                        <div className={`flex w-[18%] justify-center items-center`}>
                                            <span className={`rounded-xl w-2/3 flex items-center justify-center ${player.global_score > 0 ? 'bg-emerald-300 dark:bg-emerald-700' : (player.global_score < 0 ? 'bg-rose-300 dark:bg-rose-800' : '')}`}>{player.global_score}</span>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </>
    )
}


export default function Room({ setCurrPage }) {
    const [showValueCardsPlayerId, setShowValueCardsPlayerId] = useState(-1)
    const [isCardsOrderReverse, setIsCardsOrderReverse] = useLocalStorage("cardsOrderReverse", false)

    useEffect(() => {
        let wakeLock = null;

        async function requestWakeLock() {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                console.log('屏幕保持唤醒状态已启用:', wakeLock);
            } catch (err) {
                console.error('请求屏幕保持唤醒状态时出错:', err);
            }
        }

        function releaseWakeLock() {
            if (wakeLock) {
                wakeLock.release()
                    .then(() => {
                        console.log('屏幕保持唤醒状态已释放');
                    })
                    .catch((err) => {
                        console.error('释放屏幕保持唤醒状态时出错:', err);
                    });
            }
        }

        // 在组件挂载时请求屏幕保持唤醒状态
        requestWakeLock();

        // 在组件卸载时释放屏幕保持唤醒状态
        return () => {
            releaseWakeLock();
        };
    }, []);

    function resetShowValueCardsPlayerId() {
        setShowValueCardsPlayerId(-1)
    }

    return (
        <div className="flex flex-col justify-between items-center h-screen bg-blue-100 dark:bg-neutral-800">
            <GameHeader height='' showValueCardsPlayerId={showValueCardsPlayerId} resetShowValueCardsPlayerId={resetShowValueCardsPlayerId} setCurrPage={setCurrPage} />
            <GameNeck
                height='flex-1'
                showValueCardsPlayerId={showValueCardsPlayerId}
                resetShowValueCardsPlayerId={resetShowValueCardsPlayerId}
                isCardsOrderReverse={isCardsOrderReverse}
            />
            <GameMain
                height='h-44'
                showValueCardsPlayerId={showValueCardsPlayerId}
                resetShowValueCardsPlayerId={resetShowValueCardsPlayerId}
                setCurrPage={setCurrPage}
                isCardsOrderReverse={isCardsOrderReverse}
            />
            <GameFooter setShowValueCardsPlayerId={setShowValueCardsPlayerId} />
        </div>
    )
}