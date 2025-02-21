import Image from "next/image";
import React from "react";
import styled, { keyframes } from "styled-components";

const leftAnimation = keyframes`
0% {left: 50px}
15% {left: 150px}
50% {left: 150px}
65% {left: 50px}
100% {left: 50px}
`;

const rightAnimation = keyframes`
0% {right: 50px}
15% {right: 150px}
50% {right: 150px}
65% {right: 50px}
100% {right: 50px}
`;

const leftAnimation1080 = keyframes`
0% {right: 0}
15% {right: 150px}
50% {right: 150px}
65% {right: 0}
100% {right: 0}
`;

const rightAnimation1080 = keyframes`
0% {left: 0}
15% {left: 150px}
50% {left: 150px}
65% {left: 0}
100% {left: 0}
`;

const textanimation = keyframes`
0% {top: -60px}
15% {top: 0}
50% {top: 0}
65% {top: -60px}
100% {top: -60px}
`;

const Wrapper = styled.div`
  height: ${(props) => (props.height ? props.height : "500px")};
  width: fit-content;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  .left {
    height: 220px;
    width: 220px;
    animation-name: ${leftAnimation};
    animation-duration: 4s;
    animation-iteration-count: infinite;
    @media screen and (max-width: 1080px) {
      animation-name: ${leftAnimation1080};
    }
    @media screen and (max-width: 768px) {
      animation-name: none;
    }
  }

  .right {
    animation-name: ${rightAnimation};
    animation-duration: 4s;
    animation-iteration-count: infinite;
    @media screen and (max-width: 1080px) {
      animation-name: ${rightAnimation1080};
    }
    @media screen and (max-width: 768px) {
      animation-name: none;
    }
  }

  img {
    width: 150px;
    height: 150px;
    object-fit: contain;
    position: relative;
    bottom: 40px;

    @media screen and (max-width: 1080px) {
      width: 120px;
      height: 120px;
    }
    @media screen and (max-width: 600px) {
      width: 100px;
      height: auto;
    }
  }

  .detail {
    font-family: "ClashDisplay-700";
    font-style: normal;
    /* font-weight: 700; */
    font-size: 4rem;
    line-height: 4rem;
    position: relative;
    color: #ffffff;
    /* @media screen and (max-width: 110px) {
      font-size: 2rem;
    } */

    @media screen and (max-width: 1080px) {
      font-size: 2rem;
    }

    @media screen and (max-width: 600px) {
      line-height: 2rem;
      font-size: 1rem;
    }
  }

  .text-wrapper {
    height: 70px;
    overflow: hidden;
    text-align: center;
    position: relative;

    .inner-text-wrapper {
      animation-name: ${textanimation};
      animation-duration: 4s;
      animation-iteration-count: infinite;
      position: relative;
    }

    @media screen and (max-width: 1080px) {
      width: 350px;
    }
    @media screen and (max-width: 600px) {
      width: 200px;
    }
  }
`;

const HeroAnimation = ({ height }) => {
  return (
    <Wrapper height={height}>
      <img src="/images/nft.png" alt="NFT" className="left" />
      <div className="text-wrapper">
        <div className="inner-text-wrapper">
          <div className="first-header detail">Financialization</div>
          <div className="second-header detail">Conditional Ownership</div>
        </div>
      </div>
      <img src="/images/protocol.png" alt="Protocol" className="right" />
    </Wrapper>
  );
};

export default HeroAnimation;
