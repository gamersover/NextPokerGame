import { io } from "socket.io-client";
import { SERVER_ADDR } from "./conf";
import { rank_raw_cards } from "./card";


function connectSocket(setConnectStatus, setSocket) {
    // TODO: socket没有关闭是否可以不必重新创建？
    const socket = io(
        SERVER_ADDR,
        {
            transports: ['websocket'],
        })

    socket.on("connect", () => {
        console.log("触发了connect")
        setConnectStatus(true)
    })

    socket.on('connect_error', () => {
        console.log("触发了connect_error")
        setConnectStatus(false)
        setTimeout(() => {
            socket.connect();
        }, 1000);
    });
    setSocket(socket)
}


function handleSocket(socket, setSocket, setUserInfo, setGameInfo, setNotification, isReverse) {
    socket.on("join_room_global", (data) => {
        console.log("收到了join_room_global消息")
        if (data.status == 1) {
            setGameInfo((gameInfo) => ({
                ...gameInfo,
                host_id: data.game_info.host_id,
                players_info: data.players_info
            }))
        }
    })

    socket.on("prepare_start_global", (data) => {
        console.log("收到了prepare_start_global消息")
        if (data.status == 1) {
            setGameInfo((gameInfo) => ({
                ...gameInfo,
                players_info: data.players_info
            }))
        }
    })

    socket.on("game_start_global", (data) => {
        console.log("收到了game_start_global消息")
        const all_cards = rank_raw_cards(data.user_info.all_cards, isReverse)
        setUserInfo((userInfo) => ({
            ...userInfo,
            all_cards: all_cards.map((card, i) => ({
                id: i,
                name: card,
                showName: card,
                selected: false,
                isFriendCard: card.split("-").slice(0, 1)[0] == data.game_info.friend_card
            }))
        }))
        setGameInfo((gameInfo) => ({
            ...gameInfo,
            players_info: data.players_info,
            curr_player_id: data.game_info.curr_player_id,
            friend_card: data.game_info.friend_card,
            num_games: data.game_info.num_games,
            friend_card_cnt: 2
        }))
    })

    socket.on("game_step", (data) => {
        console.log("收到了game_step消息")
        setGameInfo((gameInfo) => ({
            ...gameInfo,
            last_valid_cards_info: data.last_valid_cards_info,
            is_start: data.is_start
        }))
    })

    socket.on("game_step_global", (data) => {
        console.log("收到了game_step_global消息")
        if (data.status === 1) {
            // 有出牌
            setGameInfo((gameInfo) => ({
                ...gameInfo,
                curr_player_id: data.game_info.curr_player_id,
                friend_card_cnt: data.game_info.friend_card_cnt,
                players_info: data.players_info,
                friend_help_info: data.game_info.friend_help_info
            }))
        }
        else if (data.status === 2) {
            setGameInfo((gameInfo) => ({
                ...gameInfo,
                curr_player_id: data.game_info.curr_player_id,
                friend_card_cnt: data.game_info.friend_card_cnt,
                players_info: data.players_info,
                friend_help_info: data.game_info.friend_help_info
            }))
        }
        else if (data.status === 3) {
            setGameInfo((gameInfo) => ({
                ...gameInfo,
                friend_card_cnt: data.game_info.friend_card_cnt,
                winners_order: data.game_info.winners_order,
                players_info: data.players_info,
            }))
        }
    })

    socket.on("player_exit", data => {
        console.log("收到了player_exit消息")
        if (data.status == 1) {
            setGameInfo((gameInfo) => ({
                ...gameInfo,
                players_info: data.players_info,
                host_id: data.game_info.host_id,
                state: data.game_info.state,
                exited_player_id: data.game_info.exited_player_id
            }))
        }
    })

    socket.on("player_reconnect_global", data => {
        console.log("收到了player_reconnect_global消息")
        setGameInfo((gameInfo) => ({
            ...gameInfo,
            players_info: data.players_info,
            state: data.game_info.state
        }))
    })

    socket.on("disconnect", () => {
        console.log("收到了disconnect消息")
        setNotification(() => ({ msg: "服务端断开连接" }))
        socket.close()
        setTimeout(() => window.location.reload(), 2000)
    })
    setSocket(socket)
}


export {
    connectSocket,
    handleSocket
}