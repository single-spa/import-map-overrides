import { h } from "preact";

function CrossIcon() {
  return (
    <div className="imo-icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="17"
        height="17"
        viewBox="0 0 17 17"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M9.44281 8.34277L12.3047 11.2047C12.5651 11.4651 12.5651 11.8872 12.3047 12.1475C12.0444 12.4079 11.6223 12.4079 11.3619 12.1475L8.5 9.28558L5.63807 12.1475C5.37772 12.4079 4.95561 12.4079 4.69526 12.1475C4.43491 11.8872 4.43491 11.4651 4.69526 11.2047L7.55719 8.34277L4.69526 5.48084C4.43491 5.22049 4.43491 4.79839 4.69526 4.53804C4.95561 4.27769 5.37772 4.27769 5.63807 4.53804L8.5 7.39996L11.3619 4.53804C11.6223 4.27769 12.0444 4.27769 12.3047 4.53804C12.5651 4.79839 12.5651 5.22049 12.3047 5.48084L9.44281 8.34277Z"
        />
      </svg>
    </div>
  );
}
export function CustomInput(props) {
  const { id, icon, value, onChange, ariaLabelledBy, inputRef, required } =
    props;

  const handleInputchange = (evt) => onChange(evt.target.value);
  const resetInput = () => {
    inputRef.current?.focus();
    onChange("");
  };

  return (
    <div className="imo-custom-input-container">
      {icon}
      <input
        id={id}
        type="text"
        tabIndex={1}
        value={value}
        aria-labelledby={ariaLabelledBy}
        onInput={handleInputchange}
        ref={inputRef}
        required={!!required}
      />
      <div role="button" class="reset-button" onClick={resetInput}>
        <CrossIcon />
      </div>
    </div>
  );
}
