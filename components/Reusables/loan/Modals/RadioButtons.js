import React from "react";
import styled from "styled-components";

const Wrapper = styled.label`
  display: inline-flex;
  align-items: center;
  margin-right: 10px;
  transition: all 0.2s ease-in;
  color: white;
  font-family: "Numans", sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 14.1px;
`;

const RadioButtons = ({ label, labelID, clickHandler, checked, groupName }) => {
  return (
    <Wrapper htmlFor={labelID}>
      <input
        className="!w-4 !h-4 !text-[#23963E] !accent-[#23963E] !bg-gray-100 border-[#23963E] !rounded-lg mr-2 cursor-pointer"
        type="checkbox"
        name={groupName}
        id={labelID}
        checked={checked}
        onChange={clickHandler}
        onClick={clickHandler}
      />
      {label}
    </Wrapper>
  );
};

export default RadioButtons;
