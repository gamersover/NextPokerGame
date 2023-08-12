"use client";

import { BackDrop, CardsPanel, CircleContent, GameButton, Modal, ScoreAlert, Toast } from '@/components';
import { GameInfoContext, SocketContext, UserInfoContext } from '@/components/GameContext';
import { GameState, PlayerState, getNowFormatDate } from '@/utils/tool';
import Image from 'next/image';
import { useContext, useState, useEffect, useMemo } from 'react';
import { SPECIAL_CARDS, is_valid_out_cards } from '@/utils/card';
import { OutState } from '@/utils/card';
import { useRouter } from 'next/navigation';


function GameAvater({ imgUrl, playerState, width = 30, height = 30, alt = '' }) {
    const opacityValue = playerState >= PlayerState.Prepared ? 'opacity-100' : 'opacity-60'
    const actived = playerState == PlayerState.RoundStart

    return (
        <>
            <Image src={imgUrl} width={width} height={height} alt={alt} className={`rounded-full shadow-md border-white border-[1px] w-auto h-auto ${opacityValue} ${actived ? "animate-bounce" : ''}`} />
        </>
    )
}


function ScoreContent({ playerCurrScore, playerState, finalScore }) {
    const [currScore, setCurrScore] = useState(0)
    const [totalScore, setTotalScore] = useState(0)

    useEffect(() => {
        if (playerState === PlayerState.RoundStart) {
            setTotalScore((prevTotalScore) => prevTotalScore + currScore);
            setCurrScore(0);
        } else if (playerState === PlayerState.GameEnd) {
            setTotalScore(finalScore);
            setCurrScore(0);
        } else {
            setCurrScore(playerCurrScore);
        }
    }, [playerState, playerCurrScore, currScore, finalScore]);

    const scoreContent = (
        <>
            <span className="text-yellow-600">{totalScore}</span>
            {currScore > 0 && <div><span className="text-green-500">+</span><span className="text-green-500">{currScore}</span></div>}
        </>
    )
    return (
        <CircleContent circleTitle={"分"} circleChild={scoreContent} titleBgColor={'bg-cyan-100'} circleSize="small" contentSize="small" />
    )
}


function GameBasicInfo({ playerName, playerAvatar, playerCurrScore, playerState, finalScore }) {
    return (
        <div className="flex flex-col items-center justify-between rounded-t-full rounded-md bg-white bg-opacity-30">
            <GameAvater imgUrl={playerAvatar} playerState={playerState} />
            <div className="flex justify-center items-center my-1">
                <span className="text-xs">
                    {playerName || '无名称'}
                </span>
            </div>
            <ScoreContent playerCurrScore={playerCurrScore} playerState={playerState} finalScore={finalScore} />
        </div>
    )
}

function JokerCards({ playerState, new_joker_cards }) {
    const [jokerCards, setJokerCards] = useState([])

    useEffect(() => {
        if (playerState === PlayerState.RoundStart) {
            setJokerCards((prevJokerCards) =>
                [...prevJokerCards,
                ...new_joker_cards]
            )
        }
    }, [new_joker_cards, playerState])

    return (
        <div className="flex flex-col mt-8 shadow-md">
            {
                jokerCards.map((card, i) => (
                    <img key={i} src={`/${card}.svg`} width={25} className="-mt-8" />
                ))
            }
        </div>
    )
}


function GameCardInfo({ num_cards, new_joker_cards, playerState }) {
    return (
        <div className="flex flex-col justify-between flex-1">
            <div className="h-1/2 flex justify-center items-center">
                {playerState >= PlayerState.GameStart && (
                    <div className="w-full h-full bg-[url('/red.svg')] bg-center bg-contain bg-no-repeat flex justify-center items-center">
                        <span className="text-white font-medium">{num_cards != null ? num_cards : '?'}</span>
                    </div>
                )}
            </div>
            <div className="flex w-full flex-1 justify-center items-center">
                <JokerCards playerState={playerState} new_joker_cards={new_joker_cards} />
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
                scoreObj={{ score: left ? left.cards_value : 0, num_rounds: left ? left.num_rounds : 0 }}
                is_exited={left ? left.is_exited==1 : 0}
            />
            <PlayerOut
                style={'justify-start items-center mr-1'}
                state={top ? top.state : null}
                valid_cards={top ? top.valid_cards : []}
                scoreObj={{ score: top ? top.cards_value : 0, num_rounds: top ? top.num_rounds : 0 }}
                is_exited={top ? top.is_exited==1 : 0}
            />
            <PlayerOut
                style={'justify-center items-end'}
                state={right ? right.state : null}
                valid_cards={right ? right.valid_cards : []}
                scoreObj={{ score: right ? right.cards_value : 0, num_rounds: right ? right.num_rounds : 0 }}
                is_exited={right ? right.is_exited==1 : 0}
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
                        <div className="flex w-7/12 justify-between">
                            <GameButton title={"否"} classes="bg-white border-2 border-gray-400 !h-7 w-12" onClick={handleCancel}/>
                            <GameButton title={"是"} classes="bg-red-400 text-white !h-7 w-12" onClick={handleOk}/>
                        </div>
                    ) : <GameButton title={"不等待，退出房间"} classes="!text-sm bg-red-400 text-white !h-7 w-32" onClick={handleMainButtonClicked}/>}
                </div>
            </div>
        </Modal>
    )
}


function GameHeader({ height }) {
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)

    const player_id = (parseInt(userInfo.player_id) + 2) % 4
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
            <img src="/times.svg" className="h-2" />
            <span className="text-violet-800 text-sm">{gameInfo.friend_card_cnt}</span>
        </div>
    )

    return (
        <div className={`flex mt-1 px-5 w-screen items-center justify-between ${height}`}>
            <div className="flex w-1/4 justify-between self-start">
                <CircleContent circleTitle={'房'} circleChild={userInfo.room_number} titleBgColor={'bg-cyan-100'} />
                <CircleContent circleTitle={'朋'} circleChild={friend_card} titleBgColor={'bg-red-100'} />
            </div>
            <div className="flex flex-1 justify-center">
                <div className="flex w-20">
                    {player_info && (
                        <>
                            <GameBasicInfo
                                playerName={player_info.player_name}
                                playerAvatar={`/avatars/Avatars Set Flat Style-${String(player_info.player_avatar).padStart(2, '0')}.png`}
                                playerCurrScore={player_info.cards_value || 0}
                                playerState={player_info.state}
                                finalScore={player_info.global_score}
                            />
                            <GameCardInfo
                                num_cards={player_info.num_cards}
                                new_joker_cards={player_info.joker_cards || []}
                                playerState={player_info.state}
                            />
                        </>
                    )}
                </div>
            </div>
            <div className='w-1/4 flex justify-end self-start'>
                {getNowFormatDate()}
            </div>
        </div>
    )
}

function GameNeck({ height }) {
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)

    const [left_player_info, right_player_info, top_player_info] = useMemo(() => {
        let left_player_info = null, right_player_info = null, top_player_info = null
        let my_player_id = parseInt(userInfo.player_id)
        let right_player_id = (my_player_id+ 1) % 4
        let top_player_id = (my_player_id + 2) % 4
        let left_player_id = (my_player_id + 3) % 4

        if (gameInfo.players_info) {
            left_player_info = gameInfo.players_info[left_player_id]
            right_player_info = gameInfo.players_info[right_player_id]
            top_player_info = gameInfo.players_info[top_player_id]
        }
        console.log("left", left_player_info)
        console.log("right", right_player_info)
        console.log("top", top_player_info)
        return [left_player_info, right_player_info, top_player_info]
    }, [gameInfo.players_info, userInfo.player_id])


    return (
        <div className={`flex justify-between items-center w-full px-2 ${height}`}>
            <div className="flex w-20">
                {left_player_info && (
                    <>
                        <GameBasicInfo
                            playerName={left_player_info.player_name}
                            playerAvatar={`/avatars/Avatars Set Flat Style-${String(left_player_info.player_avatar).padStart(2, '0')}.png`}
                            playerCurrScore={left_player_info.cards_value || 0}
                            playerState={left_player_info.state}
                            finalScore={left_player_info.global_score}
                        />
                        <GameCardInfo
                            num_cards={left_player_info.num_cards}
                            new_joker_cards={left_player_info.joker_cards || []}
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
            <div className="flex w-20">
                {right_player_info && (
                    <>
                        <GameCardInfo
                            num_cards={right_player_info.num_cards}
                            new_joker_cards={right_player_info.joker_cards || []}
                            playerState={right_player_info.state}
                        />
                        <GameBasicInfo
                            playerName={right_player_info.player_name}
                            playerAvatar={`/avatars/Avatars Set Flat Style-${String(right_player_info.player_avatar).padStart(2, '0')}.png`}
                            playerCurrScore={right_player_info.cards_value || 0}
                            playerState={right_player_info.state}
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
    const router = useRouter()

    console.log('game_info', gameInfo)

    useEffect(() => {
        if (socket) {
            socket.on("prepare_start_global", (data) => {
                console.log("收到了prepare_start_global消息")
                if (data.status == 1) {
                    setGameInfo({
                        ...gameInfo,
                        players_info: data.players_info
                    })
                }
            })
            socket.on("game_start_global", (data) => {
                console.log("收到了game_start_global消息")
                setUserInfo(userInfo => ({
                    ...userInfo,
                    all_cards: data.user_info.all_cards.map((card, i) => ({ id: i, name: card, showName: card, selected: false }))
                }))
                setGameInfo(gameInfo => ({
                    ...gameInfo,
                    players_info: data.players_info,
                    curr_player_id: data.game_info.curr_player_id,
                    friend_card: data.game_info.friend_card,
                    num_games: data.game_info.num_games
                }))
            })
            socket.on("game_step", (data) => {
                console.log("收到了game_step消息")
                setGameInfo(gameInfo => ({
                    ...gameInfo,
                    last_valid_cards_info: data.last_valid_cards_info,
                    is_start: data.is_start
                }))
            })
            socket.on("game_step_global", (data) => {
                console.log("收到了game_step_global消息")
                console.log("game_step_global data", data)
                console.log("game_step_global user info", userInfo)
                if (data.status === 1) {
                    // 有出牌
                    setGameInfo(gameInfo => ({
                        ...gameInfo,
                        curr_player_id: data.game_info.curr_player_id,
                        friend_card_cnt: data.game_info.friend_card_cnt,
                        players_info: data.players_info,
                        is_friend_help: data.game_info.is_friend_help
                    }))
                }
                else if (data.status === 2) {
                    setGameInfo(gameInfo => ({
                        ...gameInfo,
                        curr_player_id: data.game_info.curr_player_id,
                        friend_card_cnt: data.game_info.friend_card_cnt,
                        players_info: data.players_info,
                    }))
                }
                else if (data.status === 3) {
                    setGameInfo(gameInfo => ({
                        ...gameInfo,
                        friend_card_cnt: data.game_info.friend_card_cnt,
                        winners_order: data.game_info.winners_order
                    }))
                }
            })
            socket.on("player_exit", data => {
                console.log("收到了player_exit消息")
                if (data.status == 1) {
                    setGameInfo(gameInfo => ({
                        ...gameInfo,
                        players_info: data.players_info,
                        host_id: data.game_info.host_id,
                        state: data.game_info.state
                    }))
                }
            })
            socket.on("player_reconnect_global", data => {
                console.log("收到了player_reconnect_global消息")
                setGameInfo(gameInfo => ({
                    ...gameInfo,
                    players_info: data.players_info,
                    state: data.game_info.state
                }))
            })
        }
        else{
            router.back()
        }
    }, [])

    function handlePrepare() {
        if (gameInfo.players_info[userInfo.player_id].state >= PlayerState.Prepared) {
            setMessage(() => ({ msg: "已准备", key: 0 }))
        }
        else {
            socket.emit("prepare_start", {})
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

    function handleNextRound() {
        setUserInfo({
            ...userInfo,
            all_cards: [],
            out_cards: []
        })
        socket.emit("next_round")
    }

    let content = null
    const player_info = gameInfo.players_info ? gameInfo.players_info[userInfo.player_id] : {}
    let render_out_cards = []
    if (player_info.valid_cards) {
        render_out_cards = player_info.valid_cards.map(card => ({showName: card}))
    }
    else {
        render_out_cards = userInfo.out_cards
    }

    switch (player_info.state) {
        case PlayerState.InGame:
            content = <GameButton title={"准备"} classes={"bg-red-200"} onClick={handlePrepare} />
            break
        case PlayerState.Prepared:
            content = <span>已准备</span>
            break
        case PlayerState.RoundStart:
            content = (
                <div className="flex w-4/12 justify-between">
                    <GameButton title={"全选"} classes={"bg-gray-100"} onClick={handleSelectAll} />
                    <GameButton title={"跳过"} classes={"bg-red-200"} onClick={handlePass} />
                    <GameButton title={"出牌"} classes={"bg-blue-300"} onClick={handleGo} />
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
            content = <GameButton title={"再来一局"} classes={"w-20 bg-red-100"} onClick={handleNextRound} />
            break
        default:
            content = null
    }

    return (
        <div className={`flex ${height} w-screen justify-center mb-6`}>
            <div className="flex flex-1">
            </div>
            <div className="flex flex-col justify-around items-center w-10/12">
                <div className="flex w-full justify-center relative">
                    {content}
                    <ScoreAlert scoreObj={{ score: player_info.cards_value, num_rounds: player_info.num_rounds }} duration={4000} />
                </div>
                <div className="flex justify-center item-end w-screen">
                    {userInfo.all_cards && <CardsPanel cards={userInfo.all_cards} onCardSelect={handleCardSelect} />}
                </div>
            </div>
            <div className="flex flex-1 justify-start items-end mb-1">
                <JokerCards playerState={player_info.state} new_joker_cards={player_info.joker_cards || []} />
            </div>
            {message.msg && <Toast message={message} duration={4000} />}
            {gameInfo.state == GameState.GameStop && (
                <PlayerExitModal />
            )}
        </div>
    )
}

function NumberSelectPanel({ selectedNumber, onNumberSelected }) {
    const numbers = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2', null];

    return (
        <>
            {numbers.map((number, i) => (
                <GameButton
                    key={i}
                    title={number ? number : "重置"}
                    classes={`${number ? 'w-8' : 'w-28'} !h-8 m-1 !rounded-md text-gray-700 ${number == selectedNumber ? 'shadow-inner bg-amber-100' : 'shadow-md bg-amber-300'}`}
                    onClick={() => onNumberSelected(number)}
                />)
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
                    <img
                        src={`/${card.showName}.svg`}
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
                <div className="flex justify-center w-1/2">
                    <span className="text-sm">替换王牌</span>
                </div>
                <div className="flex justify-end items-center w-1/4">
                    <button className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-red-300 to-gray-300 shadow-md" onClick={handleCloseModal}>
                        <span className="text-black font-md">&times;</span>
                    </button>
                </div>
            </div>
            <div className="flex justify-evenly w-full items-center h-[85%] pb-1">
                <div className="flex flex-wrap justify-center w-1/2 h-full m-1 items-center bg-green-50 rounded-md">
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
    console.log('player_info', player_info)
    const selected_joker_cards = userInfo.all_cards.filter(card => card.selected && SPECIAL_CARDS.has(card.name))
    let game_result = []
    if (player_info.state == PlayerState.GameEnd) {
        for (let i of gameInfo.winners_order) {
            game_result.push({
                player_id: i,
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
                        <GameAvater imgUrl={`/avatars/Avatars Set Flat Style-${String(player_info.player_avatar).padStart(2, '0')}.png`} playerState={player_info.state} width={35} height={35} />
                        <CircleContent circleTitle={"名"} circleChild={userInfo.player_name} titleBgColor={'bg-cyan-100'} circleSize={"small"} />
                        <ScoreContent playerState={player_info.state} playerCurrScore={player_info.cards_value || 0} finalScore={player_info.global_score} />
                    </div>
                    {selected_joker_cards.length > 0 && (
                        <div className="flex items-end">
                            <GameButton
                                title={"替换"}
                                onClick={handleShowJokerSubstitute}
                                classes="substitute-button"
                            />
                        </div>
                    )}
                    {player_info.state == PlayerState.GameEnd && (
                        <div className="flex items-end">
                            <GameButton
                                title={"显示结果"}
                                onClick={handleshowEndModal}
                                classes="flex justify-center items-center !h-5 px-2 py-1 text-xs text-white bg-gradient-to-br from-blue-200 via-indigo-400 to-blue-200"
                            />
                        </div>
                    )}
                </div>
            </div>
            {showJokerSubs && (
                <Modal contentStyle="fixed flex rounded-lg justify-center shadow-md top-[40%] left-1/2 bg-slate-100 bg-opacity-80 w-5/12 h-1/2 -translate-x-1/2 -translate-y-1/2 z-[100]" backdropStyle="backdrop backdrop-brightness-75">
                    <JokerSubstituter jokerCards={selected_joker_cards} handleJokerSubstitute={handleJokerSubstitute} handleCloseModal={handleCloseModal} />
                </Modal>
            )}
            {showEndModal && (
                <Modal contentStyle="fixed flex flex-col justify-center top-1/2 left-1/2 w-1/2 h-[60%] -translate-x-1/2 -translate-y-1/2 z-[100]" backdropStyle="backdrop backdrop-blur-md">
                    <div className="flex flex-col h-5/6 rounded-lg bg-gradient-to-br from-blue-200 via-indigo-400 to-blue-200  justify-center items-center w-full">
                        <div className="flex h-[5%]">
                            {
                                player_info.normal_score == 2 ? <span className=" text-amber-300 font-medium -mt-3 text-2xl">胜利</span>
                                    : <span className="text-gray-400 font-medium -mt-3 text-2xl">失败</span>
                            }
                        </div>
                        <div className="flex flex-col justify-evenly flex-1 w-4/6">
                            <div className="flex w-full">
                                {["昵称", "输赢", "赏值", "分数", "总分"].map(title => (
                                    <span key={title} className="flex w-1/4 justify-center text-amber-100 text-sm">{title}</span>
                                ))}
                            </div>
                            {game_result.map(
                                player => (
                                    <div key={player.player_id} className={`flex w-full ${player.player_id == userInfo.player_id ? "bg-blue-200 rounded-md bg-opacity-80 text-orange-100" : "text-white"}`}>
                                        <span className={`flex w-1/5 justify-center text-sm`}>{player.player_name}</span>
                                        <span className={`flex w-1/5 justify-center text-sm`}>{player.normal_score}</span>
                                        <span className={`flex w-1/5 justify-center text-sm`}>{player.value_score}</span>
                                        <span className={`flex w-1/5 justify-center text-sm`}>{player.final_score}</span>
                                        <span className={`flex w-1/5 justify-center text-sm`}>{player.global_score}</span>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                    <div className="flex flex-1 justify-center items-center">
                        <GameButton
                            title={"确定"}
                            classes={"flex justify-center items-center rounded-md text-sm text-white bg-blue-400 px-3 py-2 h-[70%]"}
                            onClick={hanleColseEndModal}
                        />
                    </div>
                </Modal>
            )}
        </>
    )
}


export default function Page() {
    return (
        <div className="flex flex-col justify-between items-center h-screen bg-blue-100">
            <GameHeader height='h-1/5' />
            <GameNeck height='flex-1' />
            <GameMain height='h-40' />
            <GameFooter />
        </div>
    )
}