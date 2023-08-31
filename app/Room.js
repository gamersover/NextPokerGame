"use client";

import { CardsPanel, CircleContent, GameButton, Modal, ScoreAlert, Toast } from '@/components';
import { GameInfoContext, SocketContext, UserInfoContext } from '@/components/GameContext';
import { GameState, PlayerState } from '@/utils/tool';
import Image from 'next/image';
import { useContext, useState, useEffect, useMemo, useRef } from 'react';
import { SPECIAL_CARDS, is_valid_out_cards } from '@/utils/card';
import { OutState } from '@/utils/card';


function GameAvater({ imgUrl, playerState, playerTeam, size="sm", alt = '' }) {
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
        <>
            <Image src={imgUrl} width={50} height={50} alt={alt} className={`rounded-full shadow-md ${border_color} border-2 ${sizeType[size]} ${opacityValue} ${actived ? "animate-bounce" : ''}`} />
        </>
    )
}


function ScoreContent({ playerScore }) {
    const scoreContent = (
        <>
            <span className="text-yellow-600">{playerScore ? playerScore : '0'}</span>
        </>
    )
    return (
        <CircleContent circleTitle={"分"} circleChild={scoreContent} titleBgColor={'bg-cyan-100'} circleSize="small" contentSize="small" />
    )
}


function GameBasicInfo({ playerName, playerAvatar, playerState, playerTeam, finalScore }) {
    return (
        <div className="flex flex-col w-14 items-center justify-between rounded-t-full rounded-md bg-white bg-opacity-30">
            <GameAvater imgUrl={playerAvatar} playerState={playerState} playerTeam={playerTeam} />
            <div className="flex justify-center items-center h-4 text-xs w-[90%] my-1">
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">{playerName || '无名称'}</span>
            </div>
            <ScoreContent playerScore={finalScore} />
        </div>
    )
}

function ValueCards({ shouldShowAll, valueCards, resetShowValueCardsPlayerId }) {
    const [showAll, setShowAll] = useState(false)

    function handleShowAll() {
        setShowAll(true)
    }

    function closeShowAll() {
        setShowAll(false)
        resetShowValueCardsPlayerId()
    }

    const last_value_cards = useMemo(() => {
        return valueCards[valueCards.length-1]
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
                <Modal contentStyle={`fixed flex rounded-lg justify-center shadow-md left-1/2 top-1/2 bg-slate-300 bg-opacity-80 w-1/2 h-1/2 -translate-x-1/2 -translate-y-1/2 ${showAllFinal ? 'z-[90]' : 'z-[60]'}`} backdropStyle={`backdrop ${showAllFinal ? '!z-[89]' : '!z-[59]'} backdrop-blur-md`} onClose={closeShowAll}>
                    <div className='w-full h-full flex flex-col justify-between items-center'>
                        <div className="flex w-full h-[18%] items-center justify-center pr-1">
                            <div className="flex-1"></div>
                            <div className="flex justify-center w-2/3">
                                <span className="text-lg">赏牌</span>
                            </div>
                            <div className="flex justify-end items-center flex-1">
                                <GameButton onClick={closeShowAll}>
                                    <Image src="/close.svg" width={20} height={20} alt="" className="w-6/12"/>
                                </GameButton>
                            </div>
                        </div>
                        <div className='flex flex-wrap justify-center items-center w-[95%] flex-1'>
                            {valueCards.map((cards, i) => (
                                <div className="mx-1" key={i} >
                                    <CardsPanel cards={cards.map((card) => ({showName: card}))} size="small"/>
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
                <ValueCards shouldShowAll={shouldShowAll} valueCards={value_cards} resetShowValueCardsPlayerId={resetShowValueCardsPlayerId} />
            </div>
        </div>
    )
}

function PlayerOut({ style, state, valid_cards, is_exited, friend_card }) {
    const content = useMemo(()=> {
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
                content = valid_cards && <CardsPanel cards={valid_cards.map(card => ({ showName: card, isFriendCard: card.split("-").slice(0, 1)[0] == friend_card }))} size='small' />
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

function GameCardsOut({ right, left, top, friend_card }) {
    return (
        <>
            <PlayerOut
                style={'justify-center items-start mr-1'}
                state={left ? left.state : null}
                valid_cards={left ? left.valid_cards : []}
                is_exited={left ? left.is_exited == 1 : 0}
                friend_card={friend_card}
            />
            <PlayerOut
                style={'justify-start items-center mr-1'}
                state={top ? top.state : null}
                valid_cards={top ? top.valid_cards : []}
                is_exited={top ? top.is_exited == 1 : 0}
                friend_card={friend_card}
            />
            <PlayerOut
                style={'justify-center items-end'}
                state={right ? right.state : null}
                valid_cards={right ? right.valid_cards : []}
                is_exited={right ? right.is_exited == 1 : 0}
                friend_card={friend_card}
            />
        </>
    )
}


function PlayerExitModal() {
    const [showMoreButton, setShowMoreButton] = useState(false)

    function handleMainButtonClicked() {
        setShowMoreButton(true)
    }

    function handleCancel() {
        setShowMoreButton(false)
    }

    function handleOk() {
        window.location.reload()
    }

    return (
        <Modal contentStyle="fixed shadow-lg flex flex-col justify-center items-center top-1/2 left-1/2 w-1/3 h-1/3 -translate-x-1/2 -translate-y-1/2 z-[100]" backdropStyle="backdrop backdrop-brightness-75 !z-[99]">
            <div className="flex rounded-lg h-full w-full flex-col justify-around items-center bg-gradient-to-br from-red-100 via-red-50 to-red-100">
                <div className="w-11/12 text-red-400 h-1/3 flex items-center">
                    ❗️用户离线
                </div>
                <div className="w-10/12 text-xs h-1/3">
                    {showMoreButton ? "退出房间后游戏信息都会丢失，确定退出吗？" : "房间其他用户已断开连接，等待重连中..."}
                </div>
                <div className="w-10/12 flex items-center justify-center h-1/3">
                    {showMoreButton ? (
                        <div className="flex w-8/12 justify-between">
                            <GameButton classes="bg-white border-2 border-gray-400 !h-7 w-12" onClick={handleCancel}>否</GameButton>
                            <GameButton classes="bg-red-400 text-white !h-7 w-12" onClick={handleOk}>是</GameButton>
                        </div>
                    ) : <GameButton classes="!text-sm bg-red-400 text-white !h-7 w-32" onClick={handleMainButtonClicked}>不等待，退出房间</GameButton>}
                </div>
            </div>
        </Modal>
    )
}


function MessagePanel({ closePanel, sendMessage, messages, handleShowLast }) {
    const [message, setMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const messageContentRef = useRef(null)

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
        <Modal contentStyle="fixed flex flex-col px-2 top-12 right-28 w-1/3 h-1/2 lg:h-1/3 bg-slate-700 bg-opacity-50 rounded-md text-sm text-white z-[50]" backdropStyle="backdrop !z-[49]" onClose={closePanel}>
            <div className='h-full flex flex-col'>
                <div className='flex-grow flex-col mb-1 border-red-100 overflow-hidden overflow-y-auto' style={{ WebkitOverflowScrolling: 'touch' }} ref={messageContentRef}>
                    {
                        messages.map((msg, i) => {
                            return (
                                <div key={i} className='flex items-center border-b-[1px] h-10'>
                                    <span className='text-green-400'>{msg.player_name}：</span>
                                    <span>{msg.msg}</span>
                                </div>
                            )
                        })
                    }
                    <div className='flex justify-center text-gray-300 items-center pt-1 h-5'>无更多消息</div>
                </div>
                <div className='flex justify-center items-end mb-2 w-full'>
                    <div className='flex w-full justify-between'>
                        <input
                            className='pl-2 mr-2 flex-1 rounded-md text-black border-2 focus:border-red-200 focus:outline-none'
                            placeholder='输入聊天内容'
                            value={message}
                            onChange={handleInputChanged}
                            maxLength={20}
                        />
                        <GameButton shouldDisable={isSending} classes={`${isSending ? 'bg-gray-300 text-gray-700 opacity-50' : 'bg-red-200 text-black'}`} onClick={handleSendMessage}>
                            发送
                        </GameButton>
                    </div>
                </div>
            </div>
        </Modal>
    )
}


function GameHeader({ height, showValueCardsPlayerId, resetShowValueCardsPlayerId }) {
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
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
                <Image width={20} height={20} alt="" src="/times.svg" className="h-3" />
                <span className="text-violet-800 font-bold text-lg">{gameInfo.friend_card_cnt}</span>
            </div>
            )
    }, [gameInfo.friend_card, gameInfo.friend_card_cnt])


    function copyRoomNumber() {
        navigator.clipboard.writeText(userInfo.room_number)
    }

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

    return (
        <div className={`flex mt-1 px-5 pt-1 w-screen items-start justify-between ${height}`}>
            <div className="flex w-[30%] justify-start">
                <CircleContent className="mr-2" circleTitle={'房'} circleChild={<>{userInfo.room_number}<GameButton onClick={copyRoomNumber}><Image width={20} height={20} alt="" src="/copy.svg"></Image></GameButton></>} titleBgColor={'bg-cyan-100'} />
                <CircleContent circleTitle={'朋'} circleChild={friend_card} titleBgColor={'bg-red-100'} />
            </div>
            <div className="flex flex-1 justify-center">
                <div className="flex w-24">
                    {player_info && (
                        <>
                            <GameBasicInfo
                                playerName={player_info.player_name}
                                playerAvatar={`/avatars/Avatars Set Flat Style-${String(player_info.player_avatar).padStart(2, '0')}.png`}
                                playerState={player_info.state}
                                playerTeam={player_info.team}
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
                <GameButton classes={`${isShowMessage ? "bg-red-100" : "bg-white"} relative !w-20 !h-full border-2 border-red-100 mr-2`} onClick={handleShowMessage}>
                    <Image src="/message.svg" width={20} height={20} alt="" />消息
                    {newMessageCnt > 0 && <span className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-sm'>{newMessageCnt}</span>}
                </GameButton>
                <GameButton classes={'bg-white !w-20 !h-full border-2 border-lime-500'} onClick={() => window.location.reload()}>
                    <Image src="/logout.svg" width={20} height={20} alt="" />退出
                </GameButton>
            </div>
            { isShowMessage && <MessagePanel closePanel={() => setIsShowMessage(false)} sendMessage={sendMessage} messages={gameInfo.messages} handleShowLast={handleShowLast} />}
        </div>
    )
}

function GameNeck({ height, showValueCardsPlayerId, resetShowValueCardsPlayerId }) {
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
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
                            playerAvatar={`/avatars/Avatars Set Flat Style-${String(left_player_info.player_avatar).padStart(2, '0')}.png`}
                            playerState={left_player_info.state}
                            playerTeam={left_player_info.team}
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
                            playerAvatar={`/avatars/Avatars Set Flat Style-${String(right_player_info.player_avatar).padStart(2, '0')}.png`}
                            playerState={right_player_info.state}
                            playerTeam={right_player_info.team}
                            finalScore={right_player_info.global_score}
                        />
                    </>
                )}
            </div>
        </div>
    )
}


function GameMain({ height, showValueCardsPlayerId, resetShowValueCardsPlayerId }) {
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)
    const [notification, setNotification] = useState({ msg: null, key: 0 })
    const socket = useContext(SocketContext)
    const [selectAll, setSelectAll] = useState(false)
    const [isMouseDown, setIsMouseDown] = useState(false)

    function handlePrepare() {
        if (gameInfo.players_info[userInfo.player_id].state >= PlayerState.Prepared) {
            setNotification(() => ({ msg: "已准备", key: 0 }))
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
                setNotification(() => ({ msg: "未选择任何牌", key: 0 }))
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
                setNotification(() => ({ msg: result.msg, key: 0 }))
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
            setNotification(() => ({ msg: "非出牌时间", key: 0 }))
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
                setNotification(() => ({ msg: "无法跳过，请选择出牌", key: 0 }))
            }
        }
        else {
            setNotification(() => ({ msg: "非出牌时间", key: 0 }))
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

    const player_info = gameInfo.players_info ? gameInfo.players_info[userInfo.player_id] : {}
    let content = null
    let render_out_cards = []
    if (player_info.valid_cards) {
        render_out_cards = player_info.valid_cards.map(card => ({ showName: card, isFriendCard: card.split("-").slice(0, 1)[0] == gameInfo.friend_card}))
    }
    else {
        render_out_cards = userInfo.out_cards
    }

    switch (player_info.state) {
        case PlayerState.InGame:
            content = <GameButton classes={"bg-red-200 bg-red-200 border-[1px] border-red-400"} onClick={handlePrepare}>准备</GameButton>
            break
        case PlayerState.Prepared:
            content = <span>已准备</span>
            break
        case PlayerState.RoundStart:
            content = (
                <div className="flex w-4/12 justify-between">
                    <GameButton classes={"bg-gray-100 border-[1px] border-gray-400"} onClick={handleSelectAll}>全选</GameButton>
                    <GameButton classes={"bg-red-200 border-[1px] border-red-400"} onClick={handlePass}>跳过</GameButton>
                    <GameButton classes={"bg-blue-300 border-[1px] border-blue-400"} onClick={handleGo}>出牌</GameButton>
                </div>
            )
            break
        case PlayerState.GameStart:
            content = (
                <CardsPanel cards={render_out_cards} size="small" />
            )
            break
        case PlayerState.RoundSkip:
            content = <span>跳过</span>
            break
        case PlayerState.PlayerEnd:
            content = (
                <div>
                    <CardsPanel cards={render_out_cards} size="small" />
                    <span>{`你的排名：${player_info.rank}`}</span>
                </div>
            )
            break
        case PlayerState.GameEnd:
            content = <GameButton classes={"w-20 bg-red-200 border-[1px] border-red-400"} onClick={handleNextRound}>再来一局</GameButton>
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
                    {userInfo.all_cards.length>0 && (
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
                <ValueCards shouldShowAll={showValueCardsPlayerId == userInfo.player_id} valueCards={player_info.show_value_cards || []} resetShowValueCardsPlayerId={resetShowValueCardsPlayerId}/>
            </div>
            {notification.msg && <Toast message={notification} duration={4000} />}
            {gameInfo.state == GameState.GameStop && (
                <PlayerExitModal />
            )}
            {gameInfo.friend_help_info && gameInfo.friend_help_info.is_friend_help && (
                <div className="animate-fade-in bg-white opacity-0 px-2 rounded-md fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-red-400">
                    朋友牌已出完，触发了保护机制，玩家
                    {<span className='font-bold'> {gameInfo.players_info[gameInfo.friend_help_info.player].player_name} </span>}
                    保护了玩家
                    {<span className='font-bold'> {gameInfo.players_info[gameInfo.friend_help_info.helped_friend].player_name} </span>}
                </div>
            )}
        </div>
    )
}

function NumberSelectPanel({ selectedNumber, onNumberSelected }) {
    // TODO: 使用grid布局，或者每行4个
    const numbers = [['3', '4', '5', '6'], ['7', '8', '9', '10'], ['J', 'Q', 'K', 'A'], ['2', null]];

    return (
        <>
            {numbers.map((row, i) => (
                <div key={i} className='flex justify-around items-center'>
                    {
                        row.map((number, i) => (
                            <GameButton
                                key={i}
                                classes={`${number ? 'w-8' : 'w-28'} !h-8 m-1 !rounded-md text-gray-700 ${number == selectedNumber ? 'shadow-inner bg-amber-100' : 'shadow-md bg-amber-300'}`}
                                onClick={() => onNumberSelected(number)}
                            >
                                {number ? number : "重置"}
                            </GameButton>)
                        )
                    }
                </div>
            ))}
            {/* {numbers.map((number, i) => (
                <GameButton
                    key={i}
                    classes={`${number ? 'w-8' : 'w-28'} !h-8 m-1 !rounded-md text-gray-700 ${number == selectedNumber ? 'shadow-inner bg-amber-100' : 'shadow-md bg-amber-300'}`}
                    onClick={() => onNumberSelected(number)}
                >
                    {number ? number : "重置"}
                </GameButton>)
            )} */}
        </>
    );
}

function SubstituteJokerCards({ jokerCards, selectedCard, handleCardChange }) {
    return (
        <>
            {jokerCards.map(card => (
                <label key={card.id} className="mx-4">
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
        </>
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
        <div className="flex flex-col justify-center h-full">
            <div className="flex w-full flex-1 items-center justify-center pr-1">
                <div className="flex-1"></div>
                <div className="flex justify-center w-2/3">
                    <span className="text-lg">替换王牌</span>
                </div>
                <div className="flex justify-end items-center flex-1">
                    <button className="flex items-center justify-end" onClick={handleCloseModal}>
                        <Image src="/close.svg" width={20} height={20} alt="" className="w-5/12"/>
                    </button>
                </div>
            </div>
            <div className="flex justify-evenly w-full items-center h-[85%] pb-1">
                <div className="flex flex-wrap justify-center w-1/2 h-full m-1 items-center bg-amber-50 rounded-md">
                    <SubstituteJokerCards jokerCards={jokerCards} selectedCard={selectedCard} handleCardChange={handleCardChange} handleCloseModal={handleCloseModal} />
                </div>
                <div className="flex flex-wrap justify-center w-1/2 h-full mr-1 items-center bg-amber-50 rounded-md">
                    <NumberSelectPanel selectedNumber={selectedNumber} onNumberSelected={handleNumberSelected} />
                </div>
            </div>
        </div>
    )
}

function GameFooter({ setShowValueCardsPlayerId }) {
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)
    const [showJokerSubs, setShowJokerSubs] = useState(false)
    const [showEndModal, setShowEndModal] = useState(false)

    const player_info = useMemo(() => {
        return gameInfo.players_info ? gameInfo.players_info[userInfo.player_id] : {}
    }, [gameInfo.players_info, userInfo.player_id])

    const selected_joker_cards = useMemo(() => {
        return userInfo.all_cards.filter(card => card.selected && SPECIAL_CARDS.has(card.name))
    }, [userInfo.all_cards])

    const game_result = useMemo(()=> {
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
            <div className="bg-black bg-opacity-5 w-screen h-7 fixed left-0 bottom-0 z-0"></div>
            <div className="fixed bottom-0 flex w-screen px-5 z-10 h-7">
                <div className="flex w-full h-full items-center justify-between">
                    <div className="flex w-[30%] h-full justify-around items-center">
                        <div className='self-end'>
                            <GameAvater imgUrl={`/avatars/Avatars Set Flat Style-${String(player_info.player_avatar).padStart(2, '0')}.png`} playerState={player_info.state} playerTeam={player_info.team} size='md' />
                        </div>
                        <CircleContent circleTitle={"名"} circleChild={userInfo.player_name} titleBgColor={'bg-cyan-100'} circleSize={"small"} />
                        <ScoreContent playerScore={player_info.global_score} />
                    </div>
                    {selected_joker_cards.length > 0 && (
                        <div className="flex w-1/12 items-center justify-center">
                            <GameButton
                                onClick={handleShowJokerSubstitute}
                                classes="substitute-button"
                            >
                                替换
                            </GameButton>
                        </div>
                    )}
                    {player_info.state == PlayerState.GameEnd && (
                        <div className="flex items-end">
                            <GameButton
                                onClick={handleshowEndModal}
                                classes="flex justify-center items-center !h-5 !w-full px-2 py-1 text-xs text-white bg-indigo-400"
                            >
                                显示结果
                            </GameButton>
                        </div>
                    )}
                </div>
            </div>
            {showJokerSubs && (
                <Modal contentStyle="fixed flex rounded-lg justify-center shadow-md top-[40%] left-1/2 bg-slate-100 bg-opacity-80 w-5/12 h-1/2 lg:w-[35%] lg:h-[25%] -translate-x-1/2 -translate-y-1/2 z-[70]" backdropStyle="backdrop !z-[69] backdrop-brightness-75">
                    <JokerSubstituter jokerCards={selected_joker_cards} handleJokerSubstitute={handleJokerSubstitute} handleCloseModal={handleCloseModal} />
                </Modal>
            )}
            {showEndModal && (
                <Modal contentStyle="fixed flex flex-col justify-center top-1/2 left-1/2 w-1/2 h-[60%] lg:h-[40%] -translate-x-1/2 -translate-y-1/2 z-[80]" backdropStyle="backdrop !z-[79] backdrop-brightness-[30%]">
                    <div className="flex flex-col h-full rounded-lg bg-gray-300 justify-center items-center w-full">
                        <div className="flex w-full h-[10%]">
                            <div className="w-1/4"></div>
                            <div className="flex-1 flex justify-center">
                                {
                                    player_info.normal_score == 2 ? <span className=" text-amber-500 font-extrabold -mt-4 text-3xl">胜利</span>
                                        : <span className="text-gray-700 font-extrabold -mt-4 text-3xl">失败</span>
                                }
                            </div>
                            <div className='w-1/4 flex justify-end'>
                                <GameButton onClick={hanleColseEndModal}>
                                    <Image src="/close.svg" width={20} height={20} alt="" className="w-1/2"/>
                                </GameButton>
                            </div>
                        </div>
                        <div className="flex flex-col justify-evenly flex-1 w-5/6">
                            <div className="flex w-full">
                                <span className="flex flex-1"></span>
                                {["昵称", "输赢", "赏值", "分数", "总分"].map(title => (
                                    <span key={title} className="flex w-[18%] justify-center text-amber-500 font-bold">{title}</span>
                                ))}
                            </div>
                            {game_result.map(
                                player => (
                                    <div key={player.player_id} className={`flex w-full text-blue-800 ${player.player_id == userInfo.player_id ? "bg-blue-100 rounded-md bg-opacity-80 font-bold" : ""}`}>
                                        <div className='flex flex-1 justify-end items-center'>
                                            <Image src={`/avatars/Avatars Set Flat Style-${String(player.player_avatar).padStart(2, '0')}.png`} width={30} height={30} alt="" className="w-6 h-6 mr-1" />
                                        </div>
                                        <div className={`flex w-[18%] justify-center items-center`}>
                                            <span className="overflow-hidden text-ellipsis whitespace-nowrap">{player.player_name}</span>
                                        </div>
                                        <div className={`flex w-[18%] justify-center items-center`}>
                                            <span className={`rounded-xl w-2/3 flex items-center justify-center ${player.normal_score > 0 ? 'bg-emerald-300' : 'bg-rose-300'}`}>{player.normal_score}</span>
                                        </div>
                                        <div className={`flex w-[18%] justify-center items-center`}>{player.value_score} <GameButton classes={"!w-5 p-0"} onClick={() => setShowValueCardsPlayerId(player.player_id)}><Image src="/info-circle.svg" width={10} height={10} alt="" className='w-4 h-4'/></GameButton> </div>
                                        <div className={`flex w-[18%] justify-center items-center`}>
                                            <span className={`rounded-xl w-2/3 flex items-center justify-center ${player.final_score > 0 ? 'bg-emerald-300' : 'bg-rose-300'}`}>{player.final_score}</span>
                                        </div>
                                        <div className={`flex w-[18%] justify-center items-center`}>
                                        <span className={`rounded-xl w-2/3 flex items-center justify-center ${player.global_score > 0 ? 'bg-emerald-300' : 'bg-rose-300'}`}>{player.global_score}</span>
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


export default function Room() {
    const [showValueCardsPlayerId, setShowValueCardsPlayerId] = useState(-1)

    function resetShowValueCardsPlayerId() {
        setShowValueCardsPlayerId(-1)
    }

    return (
        <div className="flex flex-col justify-between items-center h-screen bg-blue-100">
            <GameHeader height='' showValueCardsPlayerId={showValueCardsPlayerId} resetShowValueCardsPlayerId={resetShowValueCardsPlayerId}/>
            <GameNeck height='flex-1' showValueCardsPlayerId={showValueCardsPlayerId} resetShowValueCardsPlayerId={resetShowValueCardsPlayerId}/>
            <GameMain height='h-44' showValueCardsPlayerId={showValueCardsPlayerId} resetShowValueCardsPlayerId={resetShowValueCardsPlayerId}/>
            <GameFooter setShowValueCardsPlayerId={setShowValueCardsPlayerId} />
        </div>
    )
}