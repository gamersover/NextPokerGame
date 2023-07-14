import { createContext, useState } from "react";

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
        all_cards: null,
        state: 0,  // 0: 未加入房间，1: 加入房间 2: 已准备 3: 游戏开始 4: 出牌结束
        // [].map((card, i) => ({cardName: card, selected: false})),
    })

    const [gameInfo, setGameInfo] = useState({
        host_id: null,
        players_info: null,
        curr_player_id: null,
        curr_player_name: null,
        friend_card: null,
        last_valid_cards_info: null,
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