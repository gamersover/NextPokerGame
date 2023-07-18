import { createContext, useState } from "react";
import { GameState } from "@/utils/tool";

export const SocketContext = createContext(null)
export const SetSocketContext = createContext(null)
export const UserInfoContext = createContext(null)
export const GameInfoContext = createContext(null)


function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null)
    const [userInfo, setUserInfo] = useState({
        room_number: null,
        player_name: 'zs',
        player_id: null,
        is_prepared: false,
        score: 0,
        all_cards: [].map((card) => ({cardName: card, selected: false})),
        state: GameState.OutGame,
        out_cards: []
    })

    const [gameInfo, setGameInfo] = useState({
        host_id: null,
        players_info: null,
        curr_player_id: null,
        curr_player_name: null,
        friend_card: null,
        friend_card_cnt: 2,
        last_player_id: null,
        last_player_num_cards: null,
        last_valid_cards: [],
        last_valid_cards_info: null,
        last_player_rank: null,
        last_player_value_cards: null,
        is_start: null,
    })

    return (
        <UserInfoContext.Provider value={[userInfo, setUserInfo]}>
            <GameInfoContext.Provider value={[gameInfo, setGameInfo]}>
                <SocketContext.Provider value={socket}>
                    <SetSocketContext.Provider value={setSocket}>
                        {children}
                    </SetSocketContext.Provider>
                </SocketContext.Provider>
            </GameInfoContext.Provider>
        </UserInfoContext.Provider>
    )
}

export default SocketProvider