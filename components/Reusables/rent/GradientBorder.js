import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  height: ${(props) => (props.height ? props.height : "fit-content")};
  width: ${(props) => (props.width ? props.width : "fit-content")};
  padding: 2px;
  background: linear-gradient(
    155.14deg,
    rgba(255, 255, 255, 0.15) -2.13%,
    rgba(255, 255, 255, 0.15) 136.58%
  );
  box-shadow: 0px 4px 49px rgba(0, 7, 72, 0.12);
  border-radius: 16px;

  .inner-wrapper {
    height: ${(props) => (props.height ? "100%" : "fit-content")};
    width: ${(props) => (props.width ? "100%" : "fit-content")};
    background-color: rgba(0, 0, 0, 0.93);
    border-radius: 16px;
  }
`;

const GradientBorder = ({
  children,
  height,
  width,
  outerContainerClassnames,
  innerContainerClassnames,
}) => {
  return (
    <Wrapper
      height={height}
      width={width}
      className={`${outerContainerClassnames}`}
    >
      <div className={`inner-wrapper ${innerContainerClassnames}`}>
        {children}
      </div>
    </Wrapper>
  );
};

export default GradientBorder;
