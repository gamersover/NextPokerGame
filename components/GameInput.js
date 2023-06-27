import { useState } from "react"

export default function GameInput({ placeholder, classes, setHasValue }) {
    const [inputValue, setInputValue] = useState('')

    function inputChangeHandler(e) {
        setInputValue(e.target.value)
        setHasValue(e.target.value !== '')
    }

    return (
        <div className={classes}>
            <input
                className={"join-modal-input"}
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => inputChangeHandler(e)}
            />
        </div>
    )
}