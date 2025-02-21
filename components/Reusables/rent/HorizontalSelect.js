import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  height: 52px;
  width: fit-content;
  display: none;
  padding: 0 25px;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  border-radius: 6px;

  @media screen and (min-width: 768px) {
    display: flex;
  }
`;
const Items = styled.div`
  height: 100%;
  width: fit-content;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 16px 10px 0 10px;
  column-gap: 16px;

  h5 {
    font-family: Numans;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
    transition: all 0.2s ease-in;
  }

  .indicator {
    height: 5px;
    width: 5px;
    border-radius: 50%;
    transition: all 0.2s ease-in;
  }
`;

const HorizontalSelect = ({
  body,
  state,
  changeHandler,
  customChangeHandler,
}) => {
  return (
    <>
      <Wrapper items={body && body.length}>
        {body.map((item, index) => (
          <Items selected={state === item} key={index}>
            <h5
              key={index}
              onClick={() => {
                changeHandler(item);
                customChangeHandler && customChangeHandler();
              }}
              className={`${state === item ? "text-green-4" : "text-smoke"}`}
              id={item}
            >
              {item}
            </h5>
            {
              <div
                className={`h-[1px] w-full bg-green-4 ${
                  state === item ? "opacity-100" : "opacity-0"
                }`}
              ></div>
            }
          </Items>
        ))}
      </Wrapper>
      <div className="w-full flex md:hidden overflow-hidden items-center bg-black-3 gap-2 rounded-md border-2 border-solid border-black-3 py-1 px-3">
        {body.map((item, index) => (
          <div
            className={`${
              state === item ? "bg-green-4" : "bg-transparent"
            } text-xs transition-all duration-300 flex items-center justify-center grow py-2 rounded-md text-white font-semibold cursor-pointer`}
            key={index}
            onClick={() => changeHandler(item)}
          >
            <h5 key={index}>{item}</h5>
            <div className="indicator"></div>
          </div>
        ))}
      </div>
    </>
  );
};

export default HorizontalSelect;
