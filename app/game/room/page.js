"use client";

import { CardsPanel, CircleContent, GameButton } from '@/components';
import { GameInfoContext, SocketContext, UserInfoContext } from '@/components/GameContext';
import { GameState, getNowFormatDate } from '@/utils/tool';
import Image from 'next/image';
import { useContext } from 'react';
import { is_valid_out_cards } from '@/utils/card';
import { OutState } from '@/utils/card';


function GameAvater({ imgUrl, playerState, width = 30, height = 30, alt = '' }) {
    const opacityValue = playerState >= GameState.Prepared ? 'opacity-100' : 'opacity-60'
    const actived = playerState == GameState.RoundStart

    return (
        <>
            <Image src={imgUrl} width={width} height={height} alt={alt} className={`rounded-full w-auto h-auto ${opacityValue} ${actived ? "animate-bounce" : ''}`} />
        </>
    )
}


function ScoreContent({ playerCurrScore, playerTotalScore }) {
    const score_content = (
        <>
            <span>{playerTotalScore}</span>
            {playerCurrScore > 0 && <div><span>+</span><span>{playerCurrScore}</span></div>}
        </>
    )
    return (
        <CircleContent circleTitle={"分"} circleChild={score_content} titleBgColor={'bg-cyan-100'} size="small" />
    )
}


function GameBasicInfo({ playerName, playerCurrScore, playerTotalScore, playerState }) {
    return (
        <div className="flex flex-col items-center justify-between bg-slate-200">
            <GameAvater imgUrl={"/avater.png"} playerState={playerState} />
            <div className="flex justify-center items-center my-1">
                <span className="text-xs">
                    {playerName || '无名称'}
                </span>
            </div>
            <ScoreContent playerCurrScore={playerCurrScore} playerTotalScore={playerTotalScore} />
        </div>
    )
}

function JokerCards({ all_joker_cards }) {
    return (
        <div className="flex flex-col mt-8 shadow-md">
            {
                (all_joker_cards ? all_joker_cards : []).map((card, i) => (
                    <img key={i} src={`/${card}.svg`} width={25} className="-mt-8" />
                ))
            }
        </div>
    )
}


function GameCardInfo({ num_cards, joker_cards }) {
    return (
        <div className="flex flex-col justify-between flex-1">
            <div className="h-1/2 flex justify-center items-center">
                <div className="w-full h-full bg-[url('/red.svg')] bg-center bg-contain bg-no-repeat flex justify-center items-center">
                    <span className="text-white font-medium">{num_cards ? num_cards : '?'}</span>
                </div>
            </div>
            <div className="flex w-full flex-1 justify-center items-center">
                <JokerCards all_joker_cards={joker_cards} />
            </div>
        </div>
    )
}

function PlayerOut({ style, state, valid_cards }) {
    let content = null;
    if (state == GameState.Prepared) {
        content = <span>已准备</span>
    }
    else if (state == GameState.RoundSkip) {
        content = <span>跳过</span>
    }
    else if (state == GameState.RoundStart) {
        content = <span>出牌中...</span>
    }
    else {
        content = valid_cards && <CardsPanel cards={valid_cards.map(card => ({ cardName: card }))} size='small'/>
    }
    return (
        <div className={`w-1/3 flex flex-col ${style}`}>
            {content}
        </div>
    )
}

function GameCardsOut({ right, left, top }) {
    return (
        <>
            <PlayerOut style={'justify-center'} state={left ? left.state : null} valid_cards={left ? left.valid_cards : []} />
            <PlayerOut style={'justify-start items-center'} state={top ? top.state : null} valid_cards={top ? top.valid_cards : []} />
            <PlayerOut style={'justify-center items-end'} state={right ? right.state : null} valid_cards={right ? right.valid_cards : []} />
        </>
    )
}


function GameHeader({ height }) {
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)

    const player_id = (userInfo.player_id + 2) % 4
    let player_info = null
    if (gameInfo.players_info) {
        player_info = gameInfo.players_info[player_id]
    }
    const friend_card = gameInfo.friend_card && (
        <div className="flex items-center justify-around w-full">
            <img
                src={`/${gameInfo.friend_card}_small.svg`}
                className="h-5"
            />
            <img src="/times.svg" className="h-3" />
            <span className="font-black text-violet-800 text-lg flex items-center justify-center">{gameInfo.friend_card_cnt}</span>
        </div>
    )

    return (
        <div className={`flex mt-1 px-5 w-screen justify-between ${height}`}>
            <div className="flex w-1/4 justify-between">
                <CircleContent circleTitle={'房'} circleChild={userInfo.room_number} titleBgColor={'bg-cyan-100'} />
                <CircleContent circleTitle={'朋'} circleChild={friend_card} titleBgColor={'bg-red-100'} />
            </div>
            <div className="flex flex-1 justify-center">
                <div className="flex w-20">
                    {player_info && (
                        <>
                            <GameBasicInfo
                                playerName={player_info.player_name}
                                playerTotalScore={gameInfo.show_sum_value[player_id]}
                                playerCurrScore={player_info.cards_value || 0}
                                playerState={player_info.state}
                            />
                            <GameCardInfo
                                num_cards={player_info.num_cards}
                                joker_cards={
                                    gameInfo.show_joker_cards[player_id]
                                }
                            />
                        </>
                    )}
                </div>
            </div>
            <div className='w-1/4 flex justify-end'>
                {getNowFormatDate()}
            </div>
        </div>
    )
}

function GameNeck({ height }) {
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)

    const right_player_id = (userInfo.player_id + 1) % 4
    const top_player_id = (userInfo.player_id + 2) % 4
    const left_player_id = (userInfo.player_id + 3) % 4

    let left_player_info = null, right_player_info = null, top_player_info = null
    if (gameInfo.players_info) {
        left_player_info = gameInfo.players_info[left_player_id]
        right_player_info = gameInfo.players_info[right_player_id]
        top_player_info = gameInfo.players_info[top_player_id]
    }
    console.log("left", left_player_info)
    console.log("right", right_player_info)
    console.log("top", top_player_info)

    return (
        <div className={`flex justify-between items-center w-full px-2 ${height}`}>
            <div className="flex w-20">
                {left_player_info && (
                    <>
                        <GameBasicInfo
                            playerName={left_player_info.player_name}
                            playerTotalScore={gameInfo.show_sum_value[left_player_id]}
                            playerCurrScore={left_player_info.cards_value}
                            playerState={left_player_info.state}
                        />
                        <GameCardInfo
                            num_cards={left_player_info.num_cards}
                            joker_cards={gameInfo.show_joker_cards[left_player_id]}
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
            <div className="flex w-20">
                {right_player_info && (
                    <>
                        <GameCardInfo
                            num_cards={right_player_info.num_cards}
                            joker_cards={gameInfo.show_joker_cards[right_player_id]}
                        />
                        <GameBasicInfo
                            playerName={right_player_info.player_name}
                            playerTotalScore={gameInfo.show_sum_value[right_player_id]}
                            playerCurrScore={right_player_info.cards_value}
                            playerState={right_player_info.state}
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
    const socket = useContext(SocketContext)

    console.log("gameInfo", gameInfo)

    function handlePrepare() {
        if (gameInfo.players_info[userInfo.player_id].state >= GameState.Prepared) {
            alert("已准备")
        }
        else {
            socket.emit("prepare_start", {})
            socket.on("prepare_start", (data) => {
                if (data.status === 1) {
                    setGameInfo(gameInfo => ({
                        ...gameInfo,
                        players_info: data.players_info
                    }))
                }
                else {
                    alert(`准备失败，${data.msg}`)
                }
            })
            socket.on("game_start_global", (data) => {
                setUserInfo(userInfo => ({
                    ...userInfo,
                    all_cards: data.user_info.all_cards.map((card, i) => ({ id: i, cardName: card, selected: false }))
                }))
                setGameInfo(gameInfo => ({
                    ...gameInfo,
                    players_info: data.players_info,
                    curr_player_id: data.game_info.first_player_id,
                    friend_card: data.game_info.friend_card,
                    num_rounds: data.game_info.num_rounds
                }))
            })
            socket.on("game_step", (data) => {
                setGameInfo(gameInfo => ({
                    ...gameInfo,
                    last_valid_cards_info: data.last_valid_cards_info,
                    is_start: data.is_start
                }))
            })
            socket.on("game_step_global", (data) => {
                console.log("game_step_global data", data)
                console.log("game_step_global user info", userInfo)
                if (data.status === 1) {
                    // 有出牌
                    setGameInfo(gameInfo => ({
                        ...gameInfo,
                        curr_player_id: data.game_info.curr_player_id,
                        friend_card_cnt: gameInfo.friend_card_cnt - data.game_info.has_friend_card ? 1 : 0,
                        players_info: data.players_info,
                        show_joker_cards: {
                            ...gameInfo.show_joker_cards,
                            [data.game_info.curr_player_id]: data.players_info[data.game_info.curr_player_id].all_joker_cards
                        },
                        show_sum_value: {
                            ...gameInfo.show_sum_value,
                            [data.game_info.curr_player_id]: data.players_info[data.game_info.curr_player_id].value_scores
                        }
                        // TODO: 需要同时将players_info里面的cards_value重置为0
                    }))
                }
                else if (data.status === 2) {
                    setGameInfo(gameInfo => ({
                        ...gameInfo,
                        curr_player_id: data.game_info.curr_player_id,
                        players_info: data.players_info,
                        show_joker_cards: {
                            ...gameInfo.show_joker_cards,
                            [data.game_info.curr_player_id]: data.players_info[data.game_info.curr_player_id].all_joker_cards
                        },
                        show_sum_value: {
                            ...gameInfo.show_sum_value,
                            [data.game_info.curr_player_id]: data.players_info[data.game_info.curr_player_id].value_scores
                        }
                        // TODO: 需要同时将players_info里面的cards_value重置为0
                    }))
                    console.log(data.players_info[data.game_info.curr_player_id].all_joker_cards)
                    console.log(gameInfo.show_joker_cards)
                }
            })
        }
    }

    function handleCardSelect(id) {
        let all_cards = userInfo.all_cards
        all_cards[id].selected = !all_cards[id].selected
        setUserInfo({
            ...userInfo,
            all_cards: all_cards
        })
    }

    function handleGo() {
        if (gameInfo.players_info[userInfo.player_id].state === GameState.RoundStart) {
            const selectedCard = userInfo.all_cards.filter(card => card.selected).map(card => card.cardName)
            const result = is_valid_out_cards(
                selectedCard,
                false,
                gameInfo.last_valid_cards_info,
                gameInfo.is_start,
            )
            if (result.status === -1 || result.status === 0) {
                alert(result.msg)
            }
            else if (result.status === 1) {
                let has_friend_card = false
                let all_cards = userInfo.all_cards.filter(card => !card.selected)
                if (selectedCard.includes(gameInfo.friend_card)) {
                    has_friend_card = true
                }
                setUserInfo({
                    ...userInfo,
                    all_cards: all_cards,
                    state: GameState.GameStart,
                    out_cards: userInfo.all_cards.filter(card => card.selected)
                })
                socket.emit("game_step", {
                    raw_out_cards: selectedCard,
                    raw_cards: result.raw_cards,
                    cards_info: result.cards_info,
                    cards_value: result.cards_value,
                    all_cards: all_cards,
                    out_state: OutState.VALID,
                    has_friend_card: has_friend_card
                })

            }
        }
        else {
            alert("非出牌时间")
        }
    }

    function handlePass() {
        if (gameInfo.players_info[userInfo.player_id].state === GameState.RoundStart) {
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
                    state: GameState.RoundSkip,
                    out_cards: []
                })
                socket.emit("game_step", {
                    out_state: OutState.PASS,
                })
            }
            else if (result.status === -1) {
                alert("无法跳过，请选择出牌")
            }
        }
        else {
            alert("非出牌时间")
        }
    }

    let content = null;
    const player_info = gameInfo.players_info[userInfo.player_id]
    // TODO: switch 语法？
    if (player_info.state === GameState.InGame) {
        content = <GameButton title={"准备"} classes={"bg-red-100 text-sm"} onClick={handlePrepare} />
    }
    else if (player_info.state === GameState.Prepared) {
        content = <span>已准备</span>
    }
    else if (player_info.state === GameState.RoundStart) {
        content = (
            <div className="flex w-2/12 justify-between">
                <GameButton title={"跳过"} classes={"bg-red-100 text-md"} onClick={handlePass} />
                <GameButton title={"出牌"} classes={"bg-blue-100 text-md"} onClick={handleGo} />
            </div>
        )
    }
    else if (player_info.state === GameState.GameStart) {
        content = (
            <CardsPanel cards={userInfo.out_cards} size="small" />
        )
    }
    else if (player_info.state === GameState.RoundSkip) {
        content = <span>跳过</span>
    }

    return (
        <div className={`flex ${height} w-screen justify-center mb-7`}>
            <div className="flex flex-1">
            </div>
            <div className="flex flex-col justify-around items-center w-10/12">
                <div className="flex w-full justify-center">
                    {content}
                </div>
                <div className="flex justify-center item-end w-screen">
                    {userInfo.all_cards && <CardsPanel cards={userInfo.all_cards} onCardSelect={handleCardSelect} />}
                </div>
            </div>
            <div className="flex flex-1 justify-start items-end mb-2">
                <JokerCards all_joker_cards={gameInfo.show_joker_cards[userInfo.player_id]} />
            </div>
        </div>
    )
}


function GameFooter() {
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)
    return (
        <>
            <div className="bg-black bg-opacity-5 w-screen h-7 fixed left-0 bottom-0 z-0"></div>
            <div className="fixed bottom-0 flex w-screen px-5 z-10 mb-1">
                <div className="flex items-end justify-around w-1/4 item-center">
                    <GameAvater imgUrl={"/avater.png"} playerState={gameInfo.players_info[userInfo.player_id].state} width={35} height={35} />
                    <CircleContent circleTitle={"名"} circleChild={userInfo.player_name} titleBgColor={'bg-cyan-100'} size={"small"} />
                    <ScoreContent playerTotalScore={gameInfo.show_sum_value[userInfo.player_id]} playerCurrScore={gameInfo.players_info[userInfo.player_id].cards_value} />
                </div>
            </div>
        </>
    )
}


export default function Page() {
    return (
        <div className="flex flex-col justify-between items-center h-screen">
            <GameHeader height='h-1/5' />
            <GameNeck height='flex-1' />
            <GameMain height='h-40' />
            <GameFooter />
        </div>
    )
}