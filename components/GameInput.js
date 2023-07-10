export default function GameInput({ placeholder, classes, setHasValue, value, setValue }) {
    function inputChangeHandler(e) {
        setValue(e.target.value)
        setHasValue(e.target.value !== '')
    }

    return (
        <div className={classes}>
            <input
                className={"join-modal-input"}
                placeholder={placeholder}
                value={value}
                onChange={(e) => inputChangeHandler(e)}
            />
        </div>
    )
}