"use client";

import { CardsPanel, CircleContent, GameButton } from '@/components';
import { GameInfoContext, SocketContext, UserInfoContext } from '@/components/GameContext';
import { GameState, getNowFormatDate } from '@/utils/tool';
import Image from 'next/image';
import { useContext } from 'react';
import { is_valid_out_cards } from '@/utils/card';
import { OutState } from '@/utils/card';


function GameAvater({ imgUrl, opacityValue = 'opacity-0', actived=false, width = 30, height = 30, alt = '' }) {
    return (
        <>
            <Image src={imgUrl} width={width} height={height} alt={alt} className={`rounded-full w-auto h-auto ${opacityValue} ${actived ? "animate-bounce" : ''}`} />
        </>
    )
}


function GameBasicInfo({ playerName, playerScore, playerState, actived }) {
    // 注意：其他用户的状态不能使用GameState管理，因为GameState是客户端管理自己的，而其他用户的状态是服务端管理的
    const opacityValue = playerState === 1 ? 'opacity-100' : 'opacity-60'

    return (
        <div className="flex flex-col items-center justify-between bg-slate-200">
            <GameAvater imgUrl={"/avater.png"} opacityValue={opacityValue} actived={actived}/>
            <div className="flex justify-center items-center my-1">
                <span className="text-xs">
                    {playerName || '无名称'}
                </span>
            </div>
            <CircleContent circleTitle={"分"} circleChild={playerScore || 0} titleBgColor={'bg-cyan-100'} size="small" />
        </div>
    )
}


function GameCardInfo() {
    return (
        <div className="flex flex-col justify-between flex-1">
            <div className="h-1/2 flex justify-center items-center">
                <div className="w-full h-full bg-[url('/red.svg')] bg-center bg-contain bg-no-repeat flex justify-center items-center">
                    <span className="text-white font-medium">27</span>
                </div>
            </div>
            <div className="flex w-full flex-1 justify-center items-center">
                <Image src="/DW.svg" width={26} height={30} alt='图像' />
            </div>
        </div>
    )
}


function GameHeader() {
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)

    const player_id = (userInfo.player_id + 2) % 4
    let player_info = null
    if (gameInfo.players_info) {
        player_info = gameInfo.players_info[player_id]
    }
    const actived = player_id === gameInfo.curr_player_id

    // TODO 朋友牌显示完善
    return (
        <div className="flex mt-2 px-5 w-screen justify-between">
            <div className="flex w-1/4 justify-between">
                <CircleContent circleTitle={'房'} circleChild={userInfo.room_number} titleBgColor={'bg-cyan-100'} />
                <CircleContent circleTitle={'朋'} circleChild={gameInfo.friend_card} titleBgColor={'bg-red-100'} />
            </div>
            <div className="flex flex-1 justify-center">
                <div className="flex w-20">
                    {player_info && (
                        <>
                            <GameBasicInfo
                                playerName={player_info.player_name}
                                playerScore={player_info.score}
                                playerState={player_info.state}
                                actived={actived}
                            />
                            <GameCardInfo />
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

function GameNeck() {
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)

    const left_player_id = (userInfo.player_id + 3) % 4
    const right_player_id = (userInfo.player_id + 1) % 4

    let left_player_info = null, right_player_info = null
    if (gameInfo.players_info) {
        left_player_info = gameInfo.players_info[left_player_id]
        right_player_info = gameInfo.players_info[right_player_id]
    }

    return (
        <div className="flex justify-between items-center w-full px-2">
            <div className="flex w-20">
                {left_player_info && (
                    <>
                        <GameBasicInfo
                            playerName={left_player_info.player_name}
                            playerScore={left_player_info.score}
                            playerState={left_player_info.state}
                            actived={left_player_id === gameInfo.curr_player_id}
                        />
                        <GameCardInfo />
                    </>
                )}
            </div>
            <div className="flex w-20">
                {right_player_info && (
                    <>
                        <GameBasicInfo
                            playerName={right_player_info.player_name}
                            playerScore={right_player_info.score}
                            playerState={right_player_info.state}
                            actived={right_player_id === gameInfo.curr_player_id}
                        />
                        <GameCardInfo />
                    </>
                )}
            </div>
        </div>
    )
}


function GameMain() {
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)
    const socket = useContext(SocketContext)

    function handlePrepare() {
        if (userInfo.state >= GameState.Prepared) {
            alert("已准备")
        }
        else {
            socket.emit("prepare_start", {})
            socket.on("prepare_start", (data) => {
                if (data.status === 1) {
                    setUserInfo({
                        ...userInfo,
                        state: GameState.Prepared
                    })
                }
                else {
                    alert(`准备失败，${data.msg}`)
                }
            })
            socket.on("game_start_global", (data) => {
                setUserInfo(userInfo => ({
                    ...userInfo,
                    state: data.first_player_id === userInfo.player_id ? GameState.RoundStart : GameState.GameStart,
                    all_cards: data.all_cards.map((card, i) => ({ id: i, cardName: card, selected: false })) // 不是简单的赋值，需要初始化每个cards的选中状态为false，并未每个card生成一个唯一的id
                }))
                setGameInfo(gameInfo => ({
                    ...gameInfo,
                    curr_player_id: data.first_player_id,
                    curr_player_name: data.first_player_name,
                    friend_card: data.friend_card
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
                // TODO render_last_player_state 
                setGameInfo(gameInfo => ({
                    ...gameInfo,
                    curr_player_id: data.curr_player_id,
                    curr_player_name: data.curr_player_name
                }))
                setUserInfo(userInfo => ({
                    ...userInfo,
                    state: data.curr_player_id === userInfo.player_id ? GameState.RoundStart : GameState.GameStart
                }))
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
        if (userInfo.state === GameState.RoundStart) {
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
        if(userInfo.state === GameState.RoundStart) {
            const result = is_valid_out_cards(
                null,
                true,
                gameInfo.last_valid_cards_info,
                gameInfo.is_start,
            )
            if (result.status === 2) {
                setUserInfo({
                    ...userInfo,
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
    if (userInfo.state === GameState.InGame) {
        content = <GameButton title={"准备"} classes={"bg-red-100 text-sm"} onClick={handlePrepare} />
    }
    else if (userInfo.state === GameState.Prepared) {
        content = <span>已准备</span>
    }
    else if (userInfo.state === GameState.RoundStart) {
        content = (
            <div className="flex w-2/12 justify-between">
                <GameButton title={"跳过"} classes={"bg-red-100 text-md"} onClick={handlePass}/>
                <GameButton title={"出牌"} classes={"bg-blue-100 text-md"} onClick={handleGo} />
            </div>
        )
    }
    else if (userInfo.state === GameState.GameStart) {
        content = (
            <>
                <CardsPanel cards={userInfo.out_cards} size="small"/>
            </>
        )
    }
    else if (userInfo.state === GameState.RoundSkip) {
        content = <span>跳过</span>
    }

    return (
        <div className="flex h-2/5 w-full justify-center mb-7">
            <div className="flex flex-col justify-around items-center w-full">
                <div className="flex w-full justify-center">
                    {content}
                </div>
                <div className="flex justify-center item-end w-screen">
                    {userInfo.all_cards && <CardsPanel cards={userInfo.all_cards} onCardSelect={handleCardSelect} />}
                </div>
            </div>
        </div>
    )
}


function GameFooter() {
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)

    const opacityValue = userInfo.state >= GameState.Prepared ? "opacity-100" : "opacity-60"
    const actived = userInfo.state === GameState.RoundStart

    return (
        <>
            <div className="bg-black bg-opacity-5 w-screen h-7 fixed left-0 bottom-0 z-0"></div>
            <div className="fixed bottom-0 flex w-screen px-5 z-10 mb-1">
                <div className="flex items-end justify-around w-1/4 item-center">
                    <GameAvater imgUrl={"/avater.png"} opacityValue={opacityValue} width={35} height={35} actived={actived} />
                    <CircleContent circleTitle={"名"} circleChild={userInfo.player_name} titleBgColor={'bg-cyan-100'} size={"small"} />
                    <CircleContent circleTitle={"分"} circleChild={userInfo.score} titleBgColor={'bg-cyan-100'} size={"small"} />
                </div>
            </div>
        </>
    )
}


export default function Page() {
    // TODO 每个组件必须设定固定高度
    return (
        <div className="flex flex-col justify-between items-center h-screen">
            <GameHeader />
            <GameNeck />
            <GameMain />
            <GameFooter />
        </div>
    )
}