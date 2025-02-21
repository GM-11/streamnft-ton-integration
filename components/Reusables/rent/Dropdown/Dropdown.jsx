import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import GradientBorder from "../GradientBorder";

const Wrapper = styled.div`
  height: fit-content;
  width: fit-content;
  position: relative;
  padding: 0 0.5rem;
  background: ${(props) => (props.noBackground ? "none" : "#292929")};
  border-radius: 6px;
  height: 52px;

  h5 {
    font-family: Numans;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
    color: #fff;
  }
`;
const Header = styled.div`
  height: ${(props) => props.height};
  width: ${(props) => props.width};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: 0 15px;
  padding-bottom: 5px;

  svg {
    margin-left: 5px;
    transition: all 0.2s ease-in;
    transform: ${(props) => (props.open ? "rotate(180deg)" : "rotate(0deg)")};
  }
`;
const Body = styled.div`
  position: absolute;
  top: 110%;
  transition: all 0.2s ease-in;
  overflow: hidden;
  padding: ${(props) => (props.open ? `2px` : "0 2px")};
  background: #292929;
  border-radius: 6px;
  box-shadow: 0px 4px 49px rgba(0, 7, 72, 0.12);
  backdrop-filter: blur(7.5px);
  width: ${(props) => props.width};
  z-index: 100;

  .inner-wrapper {
    height: ${(props) => (props.open ? `${props.body.length * 50}px` : "0px")};
    min-width: 100px;
    border-radius: 6px;
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
      &.selected {
        background: #30b750;
      }
    }
  }
`;

const Dropdown = ({
  body,
  state,
  changeHandler,
  height,
  width,
  noBorder,
  className,
  noBackground = false,
}) => {
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
    <Wrapper noBackground={noBackground}>
      {noBorder ? (
        <Header
          onClick={() => setOpen(!open)}
          ref={btnRef}
          open={open}
          height={height}
          width={width}
          id={state}
        >
          <h5>{state}</h5>
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#8d8d8d"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </div>
        </Header>
      ) : (
        <Header
          onClick={() => setOpen(!open)}
          ref={btnRef}
          open={open}
          height={height}
          width={width}
          id={state}
        >
          <h5>{state}</h5>
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#8d8d8d"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </div>
        </Header>
      )}
      <Body open={open} body={body}>
        <div className="inner-wrapper" style={{ width: width }}>
          {body.map((item, index) => (
            <div
              onClick={() => {
                changeHandler(item);
                setOpen(false);
              }}
              key={index}
              id={item}
              className={item === state ? "selected" : ""}
            >
              <h5>{item}</h5>
            </div>
          ))}
        </div>
      </Body>
    </Wrapper>
  );
};

export default Dropdown;
