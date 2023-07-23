import BackDrop from "./BackDrop"

export default function Modal({ contentStyle, backdropStyle, onClose, children }) {
    function hanleBackDropClicked() {
        onClose && onClose()
    }
    return (
        <>
            <div className={contentStyle}>
                {children}
            </div>
            <BackDrop classes={backdropStyle} onClick={hanleBackDropClicked} />
        </>
    )
}