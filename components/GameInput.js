export default function GameInput({ placeholder, classes, setHasValue, value, setValue }) {
    function handleInputChange(e) {
        setValue(e.target.value)
        setHasValue(e.target.value !== '')
    }

    return (
        <div className={classes}>
            <input
                className={"join-modal-input"}
                placeholder={placeholder}
                value={value}
                onChange={(e) => handleInputChange(e)}
            />
        </div>
    )
}