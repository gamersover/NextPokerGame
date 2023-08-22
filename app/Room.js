"use client";

import { CardsPanel, CircleContent, GameButton, Modal, ScoreAlert, Toast } from '@/components';
import { GameInfoContext, SocketContext, UserInfoContext } from '@/components/GameContext';
import { GameState, PlayerState } from '@/utils/tool';
import Image from 'next/image';
import { useContext, useState, useEffect, useMemo } from 'react';
import { SPECIAL_CARDS, is_valid_out_cards } from '@/utils/card';
import { OutState } from '@/utils/card';


function GameAvater({ imgUrl, playerState, playerTeam, width = 30, height = 30, alt = '' }) {
    const opacityValue = playerState < PlayerState.Prepared || playerState == PlayerState.PlayerEnd ? 'opacity-60' : 'opacity-100'
    const actived = playerState == PlayerState.RoundStart
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
            <Image src={imgUrl} width={width} height={height} alt={alt} className={`rounded-full shadow-md ${border_color} border-2 w-auto h-auto ${opacityValue} ${actived ? "animate-bounce" : ''}`} />
        </>
    )
}


function ScoreContent({ currScore, totalScore, playerState, finalScore }) {
    const scoreContent = (
        <>
            <span className="text-yellow-600">{playerState === PlayerState.GameEnd ? finalScore : totalScore}</span>
            {currScore > 0 && <div><span className="text-green-500">+</span><span className="text-green-500">{currScore}</span></div>}
        </>
    )
    return (
        <CircleContent circleTitle={"分"} circleChild={scoreContent} titleBgColor={'bg-cyan-100'} circleSize="small" contentSize="small" />
    )
}


function GameBasicInfo({ playerName, playerAvatar, playerCurrScore, playerTotalScore, playerState, playerTeam, finalScore }) {
    return (
        <div className="flex flex-col w-14 items-center justify-between rounded-t-full rounded-md bg-white bg-opacity-30">
            <GameAvater imgUrl={playerAvatar} playerState={playerState} playerTeam={playerTeam} />
            <div className="flex justify-center items-center h-4 text-xs w-[90%] my-1">
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">{playerName || '无名称'}</span>
            </div>
            <ScoreContent currScore={playerCurrScore} totalScore={playerTotalScore} playerState={playerState} finalScore={finalScore} />
        </div>
    )
}

function ValueCards({ playerState, valueCards }) {
    const [showAll, setShowAll] = useState(false)

    function handleShowAll() {
        setShowAll(true)
    }

    const last_value_cards = valueCards[valueCards.length-1]

    return (
        <>
            <div className="flex flex-col shadow-md" onClick={handleShowAll}>
                {last_value_cards && (
                    last_value_cards.slice(-1).map((card, i) => (
                        <Image key={i} src={`/pokers/${card}.svg`} width={20} height={20} alt='' className="w-7" />
                    ))
                )}
            </div>
            {showAll && (
                <Modal contentStyle="fixed flex rounded-lg justify-center shadow-md left-1/2 top-1/2 bg-slate-100 bg-opacity-80 w-1/2 h-1/2 -translate-x-1/2 -translate-y-1/2 z-[100]" backdropStyle="backdrop backdrop-blur" onClose={() => setShowAll(false)}>
                    <div className='w-full h-full flex flex-col justify-between items-center'>
                        <div className="flex w-full h-[18%] items-center justify-center pr-1">
                            <div className="flex-1"></div>
                            <div className="flex justify-center w-2/3">
                                <span className="text-lg">赏牌</span>
                            </div>
                            <div className="flex justify-end items-center flex-1">
                                <GameButton onClick={() => setShowAll(false)}>
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


function GameCardInfo({ num_cards, value_cards, playerState }) {
    return (
        <div className="flex flex-col justify-between flex-1">
            <div className="h-1/2 flex justify-center items-center">
                {playerState >= PlayerState.GameStart && (
                    <div className="w-full h-full bg-[url('/pokers/red.svg')] bg-center bg-contain bg-no-repeat flex justify-center items-center">
                        <span className="text-white font-medium">{num_cards != null ? num_cards : '?'}</span>
                    </div>
                )}
            </div>
            <div className="flex w-full flex-1 justify-center items-end">
                <ValueCards playerState={playerState} valueCards={value_cards} />
            </div>
        </div>
    )
}

function PlayerOut({ style, state, valid_cards, scoreObj, is_exited }) {
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
            content = valid_cards && <CardsPanel cards={valid_cards.map(card => ({ showName: card }))} size='small' />
        }
    }
    return (
        <div className={`w-1/3 flex flex-col relative ${style}`}>
            <ScoreAlert scoreObj={scoreObj} duration={4000} />
            {content}
        </div>
    )
}

function GameCardsOut({ right, left, top }) {
    return (
        <>
            <PlayerOut
                style={'justify-center items-start mr-1'}
                state={left ? left.state : null}
                valid_cards={left ? left.valid_cards : []}
                scoreObj={{ score: left ? left.curr_cards_value : 0, num_rounds: left ? left.num_rounds : 0 }}
                is_exited={left ? left.is_exited == 1 : 0}
            />
            <PlayerOut
                style={'justify-start items-center mr-1'}
                state={top ? top.state : null}
                valid_cards={top ? top.valid_cards : []}
                scoreObj={{ score: top ? top.curr_cards_value : 0, num_rounds: top ? top.num_rounds : 0 }}
                is_exited={top ? top.is_exited == 1 : 0}
            />
            <PlayerOut
                style={'justify-center items-end'}
                state={right ? right.state : null}
                valid_cards={right ? right.valid_cards : []}
                scoreObj={{ score: right ? right.curr_cards_value : 0, num_rounds: right ? right.num_rounds : 0 }}
                is_exited={right ? right.is_exited == 1 : 0}
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
        <Modal contentStyle="fixed shadow-lg flex flex-col justify-center items-center top-1/2 left-1/2 w-1/3 h-1/3 -translate-x-1/2 -translate-y-1/2 z-[100]" backdropStyle="backdrop backdrop-brightness-75">
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


function NotificationPanel({ setShowNotification }) {
    function handleCloseModal() {
        setShowNotification(false)
    }

    return (
        <Modal contentStyle="fixed flex flex-col justify-center top-[10%] right-[10%] w-1/5 h-1/3 bg-gray-500 bg-opacity-20 rounded-md z-[100]" backdropStyle="backdrop" onClose={handleCloseModal}>
            正在建设中
        </Modal>
    )
}


function GameHeader({ height }) {
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)
    const [showNotification, setShowNotification] = useState(false)


    const player_id = (parseInt(userInfo.player_id) + 2) % 4
    let player_info = null
    if (gameInfo.players_info) {
        player_info = gameInfo.players_info[player_id]
    }
    const friend_card = gameInfo.friend_card && (
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

    return (
        <div className={`flex mt-1 px-5 pt-1 w-screen items-start justify-between ${height}`}>
            <div className="flex w-[26%] justify-between">
                <CircleContent circleTitle={'房'} circleChild={userInfo.room_number} titleBgColor={'bg-cyan-100'} />
                <CircleContent circleTitle={'朋'} circleChild={friend_card} titleBgColor={'bg-red-100'} />
            </div>
            <div className="flex flex-1 justify-center">
                <div className="flex w-24">
                    {player_info && (
                        <>
                            <GameBasicInfo
                                playerName={player_info.player_name}
                                playerAvatar={`/avatars/Avatars Set Flat Style-${String(player_info.player_avatar).padStart(2, '0')}.png`}
                                playerCurrScore={player_info.curr_cards_value || 0}
                                playerTotalScore={player_info.total_cards_value || 0}
                                playerState={player_info.state}
                                playerTeam={player_info.team}
                                finalScore={player_info.global_score}
                            />
                            <GameCardInfo
                                num_cards={player_info.num_cards}
                                value_cards={player_info.show_value_cards || []}
                                playerState={player_info.state}
                            />
                        </>
                    )}
                </div>
            </div>
            <div className='w-[26%] h-10 flex justify-end'>
                <GameButton classes={`${showNotification ? "bg-red-100" : "bg-white"} !w-20 !h-full border-2 border-red-200 mr-2`} onClick={() => setShowNotification(true)}>
                    <Image src="/message.svg" width={20} height={20} alt="" />消息
                </GameButton>
                <GameButton classes={'bg-white !w-20 !h-full border-2 border-lime-500'} onClick={() => window.location.reload()}>
                    <Image src="/logout.svg" width={20} height={20} alt="" />退出
                </GameButton>
            </div>
            { showNotification && <NotificationPanel setShowNotification={setShowNotification}/>}
        </div>
    )
}

function GameNeck({ height }) {
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)

    const [left_player_info, right_player_info, top_player_info] = useMemo(() => {
        let left_player_info = null, right_player_info = null, top_player_info = null
        let my_player_id = parseInt(userInfo.player_id)
        let right_player_id = (my_player_id + 1) % 4
        let top_player_id = (my_player_id + 2) % 4
        let left_player_id = (my_player_id + 3) % 4

        if (gameInfo.players_info) {
            left_player_info = gameInfo.players_info[left_player_id]
            right_player_info = gameInfo.players_info[right_player_id]
            top_player_info = gameInfo.players_info[top_player_id]
        }
        // console.log("left", left_player_info)
        // console.log("right", right_player_info)
        // console.log("top", top_player_info)
        return [left_player_info, right_player_info, top_player_info]
    }, [gameInfo.players_info, userInfo.player_id])


    return (
        <div className={`flex justify-between items-center w-full px-2 ${height}`}>
            <div className="flex w-24">
                {left_player_info && (
                    <>
                        <GameBasicInfo
                            playerName={left_player_info.player_name}
                            playerAvatar={`/avatars/Avatars Set Flat Style-${String(left_player_info.player_avatar).padStart(2, '0')}.png`}
                            playerCurrScore={left_player_info.curr_cards_value || 0}
                            playerTotalScore={left_player_info.total_cards_value || 0}
                            playerState={left_player_info.state}
                            playerTeam={left_player_info.team}
                            finalScore={left_player_info.global_score}
                        />
                        <GameCardInfo
                            num_cards={left_player_info.num_cards}
                            value_cards={left_player_info.show_value_cards || []}
                            playerState={left_player_info.state}
                        />
                    </>
                )}
            </div>
            <div className="flex-1 h-full mx-1 flex pt-2">
                <GameCardsOut
                    left={left_player_info}
                    right={right_player_info}
                    top={top_player_info}
                />
            </div>
            <div className="flex w-24">
                {right_player_info && (
                    <>
                        <GameCardInfo
                            num_cards={right_player_info.num_cards}
                            value_cards={right_player_info.show_value_cards || []}
                            playerState={right_player_info.state}
                        />
                        <GameBasicInfo
                            playerName={right_player_info.player_name}
                            playerAvatar={`/avatars/Avatars Set Flat Style-${String(right_player_info.player_avatar).padStart(2, '0')}.png`}
                            playerCurrScore={right_player_info.curr_cards_value || 0}
                            playerTotalScore={right_player_info.total_cards_value || 0}
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


function GameMain({ height }) {
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)
    const [message, setMessage] = useState({ msg: null, key: 0 })
    const socket = useContext(SocketContext)
    const [selectAll, setSelectAll] = useState(false)
    const [isMouseDown, setIsMouseDown] = useState(false)

    const all_cards = userInfo.all_cards

    function handlePrepare() {
        if (gameInfo.players_info[userInfo.player_id].state >= PlayerState.Prepared) {
            setMessage(() => ({ msg: "已准备", key: 0 }))
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
                setMessage(() => ({ msg: "未选择任何牌", key: 0 }))
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
                setMessage(() => ({ msg: result.msg, key: 0 }))
            }
            else if (result.status === 1) {
                let all_cards = userInfo.all_cards.filter(card => !card.selected)
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
            setMessage(() => ({ msg: "非出牌时间", key: 0 }))
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
                let all_cards = userInfo.all_cards.map(card => ({
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
                setMessage(() => ({ msg: "无法跳过，请选择出牌", key: 0 }))
            }
        }
        else {
            setMessage(() => ({ msg: "非出牌时间", key: 0 }))
        }
    }

    function handleSelectAll() {
        let all_cards = userInfo.all_cards.map(card => ({
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

    let content = null
    const player_info = gameInfo.players_info ? gameInfo.players_info[userInfo.player_id] : {}
    let render_out_cards = []
    if (player_info.valid_cards) {
        render_out_cards = player_info.valid_cards.map(card => ({ showName: card }))
    }
    else {
        render_out_cards = userInfo.out_cards
    }

    switch (player_info.state) {
        case PlayerState.InGame:
            content = <GameButton classes={"bg-red-200"} onClick={handlePrepare}>准备</GameButton>
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
            content = <GameButton classes={"w-20 bg-red-100"} onClick={handleNextRound}>再来一局</GameButton>
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
                    <ScoreAlert scoreObj={{ score: player_info.curr_cards_value, num_rounds: player_info.num_rounds }} duration={4000} />
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
                <ValueCards playerState={player_info.state} valueCards={player_info.show_value_cards || []} />
            </div>
            {message.msg && <Toast message={message} duration={4000} />}
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
    const numbers = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2', null];

    return (
        <>
            {numbers.map((number, i) => (
                <GameButton
                    key={i}
                    classes={`${number ? 'w-8' : 'w-28'} !h-8 m-1 !rounded-md text-gray-700 ${number == selectedNumber ? 'shadow-inner bg-amber-100' : 'shadow-md bg-amber-300'}`}
                    onClick={() => onNumberSelected(number)}
                >
                    {number ? number : "重置"}
                </GameButton>)
            )}
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

function GameFooter() {
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)
    const [showJokerSubs, setShowJokerSubs] = useState(false)
    const [showEndModal, setShowEndModal] = useState(false)

    const player_info = gameInfo.players_info ? gameInfo.players_info[userInfo.player_id] : {}
    // console.log('player_info', player_info)
    const selected_joker_cards = userInfo.all_cards.filter(card => card.selected && SPECIAL_CARDS.has(card.name))
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
            <div className="fixed bottom-0 flex w-screen px-5 z-10 mb-1">
                <div className="flex items-end w-full item-center justify-between">
                    <div className="flex w-1/4 justify-around items-end">
                        <GameAvater imgUrl={`/avatars/Avatars Set Flat Style-${String(player_info.player_avatar).padStart(2, '0')}.png`} playerState={player_info.state} playerTeam={player_info.team} width={35} height={35} />
                        <CircleContent circleTitle={"名"} circleChild={userInfo.player_name} titleBgColor={'bg-cyan-100'} circleSize={"small"} />
                        <ScoreContent playerState={player_info.state} currScore={player_info.curr_cards_value || 0} totalScore={player_info.total_cards_value || 0} finalScore={player_info.global_score} />
                    </div>
                    {selected_joker_cards.length > 0 && (
                        <div className="flex items-end">
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
                <Modal contentStyle="fixed flex rounded-lg justify-center shadow-md top-[40%] left-1/2 bg-slate-100 bg-opacity-80 w-5/12 h-1/2 lg:h-[40%] -translate-x-1/2 -translate-y-1/2 z-[100]" backdropStyle="backdrop backdrop-brightness-75">
                    <JokerSubstituter jokerCards={selected_joker_cards} handleJokerSubstitute={handleJokerSubstitute} handleCloseModal={handleCloseModal} />
                </Modal>
            )}
            {showEndModal && (
                <Modal contentStyle="fixed flex flex-col justify-center top-1/2 left-1/2 w-1/2 h-[60%] -translate-x-1/2 -translate-y-1/2 z-[100]" backdropStyle="backdrop backdrop-blur-md">
                    <div className="flex flex-col h-5/6 rounded-lg bg-gradient-to-br from-blue-200 via-indigo-300 to-blue-200  justify-center items-center w-full">
                        <div className="flex h-[5%]">
                            {
                                player_info.normal_score == 2 ? <span className=" text-amber-500 font-medium -mt-3 text-2xl">胜利</span>
                                    : <span className="text-gray-700 font-medium -mt-3 text-2xl">失败</span>
                            }
                        </div>
                        <div className="flex flex-col justify-evenly flex-1 w-5/6">
                            <div className="flex w-full">
                                <span className="flex flex-1"></span>
                                {["昵称", "输赢", "赏值", "分数", "总分"].map(title => (
                                    <span key={title} className="flex w-[18%] justify-center text-amber-200 font-bold">{title}</span>
                                ))}
                            </div>
                            {game_result.map(
                                player => (
                                    <div key={player.player_id} className={`flex w-full ${player.player_id == userInfo.player_id ? "bg-blue-200 rounded-md bg-opacity-80 text-amber-200 font-bold" : "text-blue-800"}`}>
                                        <div className='flex flex-1 justify-end items-center'>
                                            <Image src={`/avatars/Avatars Set Flat Style-${String(player.player_avatar).padStart(2, '0')}.png`} width={10} height={10} alt="" className="w-6 h-6 mr-1" />
                                        </div>
                                        <div className={`flex w-[18%] justify-center items-center`}>
                                            <span className="overflow-hidden text-ellipsis whitespace-nowrap">{player.player_name}</span>
                                        </div>
                                        <div className={`flex w-[18%] justify-center items-center`}>{player.normal_score}</div>
                                        <div className={`flex w-[18%] justify-center items-center`}>{player.value_score}</div>
                                        <div className={`flex w-[18%] justify-center items-center`}>{player.final_score}</div>
                                        <div className={`flex w-[18%] justify-center items-center`}>{player.global_score}</div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                    <div className="flex flex-1 justify-center items-center">
                        <GameButton
                            classes={"flex justify-center items-center rounded-md text-white bg-indigo-300 px-3 py-3 h-[80%]"}
                            onClick={hanleColseEndModal}
                        >
                            确定
                        </GameButton>
                    </div>
                </Modal>
            )}
        </>
    )
}


export default function Room() {
    return (
        <div className="flex flex-col justify-between items-center h-screen bg-blue-100">
            <GameHeader height='h-1/5' />
            <GameNeck height='flex-1' />
            <GameMain height='h-44' />
            <GameFooter />
        </div>
    )
}