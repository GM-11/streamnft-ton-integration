import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  width: ${(props) =>
    props.full ? "100%" : props.width ? props.width : "fit-content"};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};

  &:hover {
    background-color: linear-gradient(0deg, #30b750, #30b750);
  }

  .content {
    height: 48px;
    padding: 0 1rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: start;
    align-items: center;
    border: 1px solid white;
    border-radius: 10px;
    color: ${(props) => (props.color ? props.color : "#fff")};
    cursor: pointer;
    font-family: Numans;
    font-size: 12px;
    text-transform: uppercase;
  }
`;

export const StyledWalletButton = styled.div`
  position: relative;
  padding: 1rem 0;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #00bb34;
  color: black;
  border: 1px solid #00bb34;
  position: relative;
  cursor: pointer;
  font-family: ClashDisplay-600;
  text-transform: uppercase;
  border-radius: 0;
  z-index: initial;

  &:hover {
    background: #00bb34;
  }

  &::after {
    content: " ";
    height: 40px;
    width: 100%;
    background: black;
    border: 1px solid #00bb34;
    position: absolute;
    top: 5px;
    left: 5px;
    z-index: -1;
  }
`;

const Button = ({
  id,
  children,
  clickHandler,
  type,
  full,
  style,
  color,
  className,
  onMouseOver,
  onMouseOut,
  disabled = false,
}) => {
  const handleClick = (e) => {
    if (!disabled) {
      clickHandler && clickHandler(e);
    }
  };
  return (
    <Wrapper
      id={id}
      style={style}
      width={style && style.width}
      onClick={handleClick}
      type={type}
      full={full}
      color={color}
      disabled={disabled}
    >
      <div
        className={`content ${className}`}
        onMouseOver={!disabled ? onMouseOver : undefined}
        onMouseOut={!disabled ? onMouseOut : undefined}
      >
        {children}
      </div>
    </Wrapper>
  );
};

export default Button;
