import BackDrop from "./BackDrop"

export default function Modal({ classes, closeModal, children }) {
    return (
        <>
            <div className={classes}>
                {children}
            </div>
            <BackDrop onClick={closeModal}/>
        </>
    )
}