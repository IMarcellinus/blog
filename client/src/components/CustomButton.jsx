import PropTypes from 'prop-types';

function CustomButton({ title, btnStyles, textStyles, btnType, value, onClick, onSubmit,disabled }) {
  return (
    <button type={btnType || "button"} className={`custom-btn ${btnStyles}`} value={value} onClick={onClick} onSubmit={onSubmit} disabled={disabled}>
      <span className={`flex-1 ${textStyles}`}>{title}</span>
    </button>
  );
}

CustomButton.propTypes = {
  title: PropTypes.string.isRequired,
  btnStyles: PropTypes.string,
  textStyles: PropTypes.string,
  btnType: PropTypes.oneOf(['button', 'submit', 'reset']),
  value: PropTypes.string,
  onClick: PropTypes.func,
  onSubmit: PropTypes.func,
  disabled: PropTypes.bool,
};

export default CustomButton;
