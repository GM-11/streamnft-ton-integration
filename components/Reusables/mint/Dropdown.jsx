import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  height: fit-content;
  width: 100%;
  position: relative;
  padding: 0 0.5rem;
  background: ${(props) => (props.noBackground ? "none" : "#292929")};
  border-radius: 6px;
  height: 52px;

  h5 {
    font-family: Numans;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: #fff;
  }
`;
const Header = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 0 15px;
  font-size: 12px !important;
  font-family: Numans, sans-serif;
  color: ${(props) =>
    props?.state === "" ? "#afafaf !important" : "#fff !important"};

  svg {
    margin-left: 5px;
    transition: all 0.2s ease-in;
    transform: ${(props) => (props.open ? "rotate(180deg)" : "rotate(0deg)")};
  }
`;
const Body = styled.div`
  position: absolute;
  top: 110%;
  right: 0;
  transition: all 0.2s ease-in;
  overflow: hidden;
  padding: ${(props) => (props.open ? `2px` : "0 2px")};
  background: #292929;
  border-radius: 6px;
  box-shadow: 0px 4px 49px rgba(0, 7, 72, 0.12);
  backdrop-filter: blur(7.5px);
  width: 100%;
  min-width: fit-content;
  z-index: 9999;
  border: ${(props) => (props.open ? `1px solid #afafa` : "none")}f;

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

  //

  return (
    <Wrapper noBackground={noBackground}>
      {noBorder ? (
        <Header
          onClick={() => setOpen(!open)}
          ref={btnRef}
          open={open}
          state={state}
          height={height}
          width={width}
        >
          <p>{state === "" ? "Select Here" : state}</p>
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
          state={state}
          height={height}
          width={width}
        >
          <p>{state === "" ? "Select Here" : state}</p>
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
