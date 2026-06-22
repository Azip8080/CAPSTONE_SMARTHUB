import style from './Button.module.css';

function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,}){

    return <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>

}

export default Button