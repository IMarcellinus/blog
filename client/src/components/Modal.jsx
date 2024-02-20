import React from 'react'

function Modal({open, onClose, children}) {
  return (
    <div onClick={onclose} className={`fixed inset-0 flex justify-center items-center transition-colors ${open ? "visible bg-black/20" : "invisible"}`}>
        {children}
    </div>
  )
}

export default Modal