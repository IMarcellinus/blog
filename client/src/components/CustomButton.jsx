import React from 'react'

function CustomButton({title, btnStyles, textStyles, btnType, value}) {
  return (
    <button type={btnType || "button"} className={`custom-btn ${btnStyles}`} value={value}>
      <span className={`flex-1 ${textStyles}`}>{title}</span>
    </button>
  )
}

export default CustomButton