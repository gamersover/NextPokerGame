"use client";

import { CardsPanel, CircleContent, GameButton } from '@/components';
import SocketProvider, { GameInfoContext, SocketContext, UserInfoContext } from '@/components/GameContext';
import { getNowFormatDate } from '@/utils/tool';
import Image from 'next/image';
import { useContext, useId } from 'react';
import { is_valid_out_cards } from '@/utils/card';


function GameAvater({ imgUrl, opacityValue = 'opacity-0', width = 40, height = 40, alt = '' }) {
    return (
        <>
            <Image src={imgUrl} width={width} height={height} alt={alt} className={`rounded-full w-auto h-auto ${opacityValue}`} />
        </>
    )
}


function GameBasicInfo({ playerName, playerScore, playerState = 1 }) {
    const opacityValue = playerState === 1 ? 'opacity-100' : 'opacity-60'

    return (
        <div className="flex flex-col items-center justify-between bg-slate-200 p-1 w-3/5">
            <GameAvater imgUrl={"/avater.png"} opacityValue={opacityValue} />
            <div className="flex justify-center items-center my-1">
                <span className=" text-xs">
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
            <div className="flex w-full h-full flex-1 justify-center items-center">
                <Image src="/2_方块.svg" width={33} height={35} alt='图像' />
            </div>
        </div>
    )
}


function GamePlayerLeft({ playerName, playerScore, playerState }) {
    return (
        <>
            <GameBasicInfo playerName={playerName} playerScore={playerScore} playerState={playerState} />
            <GameCardInfo />
        </>
    )
}


function GamePlayerRight({ playerName, playerScore, playerState }) {
    return (
        <>
            <GameCardInfo />
            <GameBasicInfo playerName={playerName} playerScore={playerScore} playerState={playerState} />
        </>
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

    return (
        <div className="flex mt-2 px-5 w-screen justify-between">
            <div className="flex w-1/4 justify-between">
                <CircleContent circleTitle={'房'} circleChild={userInfo.room_number} titleBgColor={'bg-cyan-100'} />
                <CircleContent circleTitle={'朋'} circleChild={''} titleBgColor={'bg-red-100'} />
            </div>
            <div className="flex flex-1 justify-center">
                <div className="flex w-24">
                    {player_info && <GamePlayerLeft playerName={player_info.player_name} playerScore={player_info.score} playerState={player_info.state} />}
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
            <div className="flex w-24">
                {left_player_info && <GamePlayerLeft playerName={left_player_info.player_name} playerScore={left_player_info.score} playerState={left_player_info.state} />}
            </div>
            <div className="flex w-24">
                {right_player_info && <GamePlayerRight playerName={right_player_info.player_name} playerScore={right_player_info.score} playerState={right_player_info.state} />}
            </div>
        </div>
    )
}


function GameMain() {
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)
    const socket = useContext(SocketContext)

    // TODO: userInfo.all_cards 需要记录每个card是否被选中的状态，然后传给CardsPanel
    // 只有start的时候服务端才会传入all_cards，后续all_cards维护都是在客户端进行

    if (userInfo.player_id === gameInfo.curr_player_id) {
        console.log("我是主角")
    }

    function handlePrepare() {
        if (userInfo.is_prepared) {
            alert("已准备")
        }
        else {
            socket.emit("prepare_start", {})
            socket.on("prepare_start", (data) => {
                if (data.status === 1) {
                    setUserInfo({
                        ...userInfo,
                        is_prepared: true
                    })
                }
                else {
                    alert(`准备失败，${data.msg}`)
                }
            })
            socket.on("game_start_global", (data) => {
                setUserInfo(userInfo => ({
                    ...userInfo,
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
                setGameInfo({
                    ...gameInfo,
                    last_valid_cards_info: data.last_valid_cards_info,
                    is_start: data.is_start
                })
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
        if (gameInfo.curr_player_id === userInfo.player_id) {
            const selectedCard = userInfo.all_cards.filter(card => card.selected).map(card => card.cardName)
            console.log(selectedCard)
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
                    all_cards: all_cards
                })
            }
        }
        else {
            alert("非出牌时间")
        }
    }

    return (
        <div className="flex h-2/5 w-full justify-center mb-7">
            <div className="flex flex-col justify-around items-center w-full">
                {userInfo.is_prepared && <p>已准备</p>}
                {(userInfo.player_id && !userInfo.is_prepared) && <GameButton title={"准备"} classes={"bg-red-100 text-sm"} onClick={handlePrepare} />}
                <div className="flex w-1/6 justify-between">
                    <GameButton title={"跳过"} classes={"bg-red-100 text-md"} />
                    <GameButton title={"出牌"} classes={"bg-blue-100 text-md"} onClick={handleGo} />
                </div>
                <div className="flex justify-center item-end w-screen">
                    <CardsPanel cards={userInfo.all_cards} onCardSelect={handleCardSelect} />
                    {/* {userInfo.all_cards && <CardsPanel cards={["", "", ""]}/>} */}
                </div>
            </div>
        </div>
    )
}


function GameFooter() {
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)

    let state = 0
    if (gameInfo.players_info) {
        state = gameInfo.players_info[userInfo.player_id].state
    }

    const opacityValue = state == 1 ? "opacity-100" : "opacity-60"

    return (
        <>
            <div className=" bg-black bg-opacity-5 w-screen h-8 fixed left-0 bottom-0 z-0">
            </div>
            <div className="fixed bottom-0 flex w-screen px-10 z-10 mb-1">
                <div className="flex items-end justify-around w-1/3">
                    <GameAvater imgUrl={"/avater.png"} opacityValue={opacityValue} />
                    {/* <Image src="/avater.png" width={35} height={35} alt='图像' className={`rounded-full w-auto h-auto ${opacityValue}`} /> */}
                    <CircleContent circleTitle={"名"} circleChild={userInfo.player_name} titleBgColor={'bg-cyan-100'} />
                    <CircleContent circleTitle={"分"} circleChild={userInfo.score} titleBgColor={'bg-cyan-100'} />
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