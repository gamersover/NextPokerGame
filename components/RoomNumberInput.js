import { GameInput, GameButton } from "@/components"
import { useState } from "react"

export default function RoomNumberInput({ handleCancel, handleOk }) {
    const [hasValue, setHasValue] = useState(false)

    return (<div className="join-modal-inner">
        <GameInput placeholder={"请输入房间号"} classes={"join-modal-input-wrapper"} setHasValue={setHasValue} />
        <div className="join-modal-buttons">
            <GameButton title={"取消"} classes={"bg-blue-200"} handleClick={handleCancel} />
            <GameButton
                title={"确定"}
                classes={hasValue ? "bg-red-200" : "bg-gray-200"}
                handleClick={handleOk}
                shouldDisable={!hasValue}
            />
        </div>
    </div>
    )
}