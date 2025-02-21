import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  height: fit-content;
  width: fit-content;
  position: relative;
  margin-left: ${(props) => (props.noBorder ? `0` : "15px")};

  h5 {
    font-family: "Poppins";
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
    color: #8d8d8d;
  }
`;
const Header = styled.div`
  height: ${(props) => props.height};
  width: ${(props) => props.width};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: ${(props) => (props.noBorder ? `0` : "0 15px")};
  border: 1px solid #3d3d3d;

  svg {
    margin-left: 5px;
    transition: all 0.2s ease-in;
    transform: ${(props) => (props.open ? "rotate(0deg)" : "rotate(180deg)")};
  }
`;
const Body = styled.div`
  position: absolute;
  top: 110%;
  transition: all 0.2s ease-in;
  overflow: hidden;
  border-radius: 16px;
  padding: ${(props) => (props.open ? `2px` : "0 2px")};
  background: linear-gradient(
    155.14deg,
    rgba(255, 255, 255, 0.15) -2.13%,
    rgba(255, 255, 255, 0.15) 136.58%
  );
  box-shadow: 0px 4px 49px rgba(0, 7, 72, 0.12);
  backdrop-filter: blur(7.5px);
  z-index: 999999;
  width: ${(props) => props.width};

  .inner-wrapper {
    height: ${(props) => (props.open ? `${props.body.length * 50}px` : "0px")};
    width: 150px;
    background-color: rgba(0, 0, 0, 0.93);
    border-radius: 16px;
    transition: all 0.2s ease-in;
    overflow: hidden;

    > div {
      height: 50px;
      width: 100%;
      padding: 10px 0;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.2s ease-in;
      cursor: pointer;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }
`;

const Dropdown = ({ body, state, changeHandler, height, width, noBorder }) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef();

  useEffect(() => {
    const closeDropdown = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.body.addEventListener("click", closeDropdown);
    return () => document.body.removeEventListener("click", closeDropdown);
  }, []);

  return (
    <Wrapper noBorder={noBorder}>
      {noBorder ? (
        <Header
          onClick={() => setOpen(!open)}
          ref={btnRef}
          open={open}
          height={height}
          width={width}
          noBorder={noBorder}
        >
          <h5>{state}</h5>
        </Header>
      ) : (
        <>
          <Header
            onClick={() => setOpen(!open)}
            ref={btnRef}
            open={open}
            height={height}
            width={width}
          >
            <h5>{state}</h5>
          </Header>
        </>
      )}
      <Body open={open} body={body}>
        <div className="inner-wrapper">
          {body.map((item, index) => (
            <div onClick={() => changeHandler(item)} key={index}>
              <h5>{item}</h5>
            </div>
          ))}
        </div>
      </Body>
    </Wrapper>
  );
};

export default Dropdown;
