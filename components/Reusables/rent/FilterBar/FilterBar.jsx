import React, { useState } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  height: 48px;
  display: flex;
  justify-content: space-between;
  margin-right: 0.875rem;
`;
const Icon = styled.div`
  height: 48px;
  width: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #292929;
  border-radius: 6px;
  background: ${(props) =>
    props.isExpanded ? "#30B750" : "#292929"};

  &:hover {
    background: #30B750;
    transform: scale(1.1,1.1);
  }

  img {
    height: 17.5px;
    width: 17.5px;
  }
`;
const Input = styled.input`
  height: 100%;
  width: calc(100% - 70px);
  border: none;
  border-bottom: 1px solid white;
  background: none;
  color: #a8abcb;
  font-family: "Poppins";
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  &:focus {
    outline: none;
    border-bottom-color: #30B750;
  }
  &::placeholder {
    color: #a8abcb;
  }
`;

const FilterBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Wrapper>
      <Icon onClick={() => { setIsExpanded((prevValue) => (setIsExpanded(!prevValue))) }} isExpanded={isExpanded}>
        <img src="/images/filter.svg" alt="#" />
      </Icon>
    </Wrapper>
  );
};

export default FilterBar;
