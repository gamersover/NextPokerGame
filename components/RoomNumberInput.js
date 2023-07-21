import { GameInput, GameButton } from "@/components"
import { useContext, useEffect, useState } from "react"
import { UserInfoContext, SetSocketContext, GameInfoContext } from "./GameContext"
import { io } from "socket.io-client"
import { SERVER_ADDR } from "@/utils/conf"
import { GameState } from "@/utils/tool"

export default function RoomNumberInput({ handleCancel, handleOk }) {
    const [hasValue, setHasValue] = useState(false)
    const [inputValue, setInputValue] = useState("000000") // TODO: 初始化，方便测试
    const [userInfo, setUserInfo] = useContext(UserInfoContext)
    const [gameInfo, setGameInfo] = useContext(GameInfoContext)
    const setSocket = useContext(SetSocketContext)

    function isValidRoomNumber() {
        return hasValue && /^[0-9]{6}$/.test(inputValue)
    }

    function setRoomNumber() {
        if (/^[0-9]{6}$/.exec(inputValue)) {
            setUserInfo({ ...userInfo, room_number: inputValue })
            const socket = io(SERVER_ADDR, {
                transports: ['websocket']
            });
            setSocket(socket)
            socket.emit("join_room", {
                room_number: inputValue,
                player_name: userInfo.player_name
            })

            socket.on("join_room", (data) => {
                if (data.status == 1) {
                    const player_id = data.player_id
                    setUserInfo({
                        ...userInfo,
                        room_number: data.room_info.room_number,
                        player_id: player_id,
                        player_name: data.players_info[player_id].player_name,
                    })
                    setGameInfo({
                        ...gameInfo,
                        host_id: data.room_info.host_id,
                        players_info: data.players_info
                    })
                    handleOk()
                }
                else {
                    alert(`房间${data.room_number}加入失败，原因${data.msg}`)
                }
            })

            socket.on("join_room_others", (data) => {
                setGameInfo({
                    ...gameInfo,
                    host_id: data.room_info.host_id,
                    players_info: data.players_info
                })
            })

            socket.on("prepare_start_global", (data) => {
                setGameInfo({
                    ...gameInfo,
                    players_info: data.players_info
                })
            })
        }
        else {
            alert("房间号格式错误")
        }
    }

    useEffect(() => {
        if (/^[0-9]{6}$/.exec(inputValue)) {
            setRoomNumber()
        }
    }, [inputValue])

    return (
        <div className="join-modal-inner">
            <GameInput
                placeholder={"请输入房间号"}
                classes={"join-modal-input-wrapper"}
                setHasValue={setHasValue}
                value={inputValue}
                setValue={setInputValue}
            />
            <div className="join-modal-buttons">
                <GameButton title={"取消"} classes={"game-button bg-red-200"} onClick={handleCancel} />
                <GameButton
                    title={"确定"}
                    classes={isValidRoomNumber() ? "game-button bg-blue-200" : "game-button bg-gray-200"}
                    onClick={setRoomNumber}
                    shouldDisable={!isValidRoomNumber()}
                />
            </div>
        </div>
    )
}