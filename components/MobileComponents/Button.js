import React from "react";
import styled from "styled-components";
import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const Wrapper = styled.div`
  position: relative;
  width: ${(props) =>
    props.full ? "100%" : props.width ? props.width : "fit-content"};

  .content {
    height: 40px;
    padding: 0 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background: ${(props) => (props.type === "red" ? "red" : "#00bb34")};
    color: ${(props) => (props.color ? props.color : "#fff")};
    position: relative;
    cursor: pointer;
    font-family: ClashDisplay-600;
    text-transform: uppercase;
  }

  .btn-background {
    height: 40px;
    width: 100%;
    background: black;
    border: ${(props) =>
      props.type === "red" ? "1px solid red" : "1px solid #00bb34"};
    position: absolute;
    top: 5px;
    left: 5px;
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
const StyledSolanaWalletButton = styled(WalletMultiButton)`
  position: relative;
  height: 40px;
  padding: 0 1rem;
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

const StyledWalletButtonWrapper = styled.div`
  position: relative;
  z-index: 10;

  &:hover {
    button {
      background: #00bb34 !important;
    }
  }
`;

export const StyledWalletButton2 = () => {
  return (
    <StyledWalletButtonWrapper>
      <StyledWalletButton>Lend</StyledWalletButton>
    </StyledWalletButtonWrapper>
  );
};

const Button = ({ children, clickHandler, type, full, style, color }) => {
  return (
    <Wrapper
      style={style}
      width={style && style.width}
      onClick={clickHandler}
      type={type}
      full={full}
      color={color}
    >
      <div className="btn-background"></div>
      <div className="content font-poppins">{children}</div>
    </Wrapper>
  );
};

const Button2 = ({ classes, ...props }) => {
  return (
    <button
      className={`h-fit w-fit bg-green-4 rounded-md text-white flex p-2 px-4 ${classes}`}
      {...props}
    ></button>
  );
};

export { Button2 };

export default Button;
