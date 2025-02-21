import React from "react";
import styled from "styled-components";
import Button from "@/components/Reusables/rent/Button";

const Wrapper = styled.div`
  height: fit-content;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin: 50px 0;

  > div {
    display: flex;
    flex-direction: column;
  }

  h5 {
    font-family: "Poppins";
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 30px;
    color: #fff;
    margin-bottom: 25px;
  }

  h3 {
    font-family: "Poppins";
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 30px;
    color: #fff;
    margin-bottom: 10px;
  }

  h4 {
    font-family: "Poppins";
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 30px;
    color: #fff;
    margin-bottom: 10px;
  }

  .heading-one {
    font-family: ClashDisplay-400;
    color: #fff;
    font-size: 4rem;
    display: inline;
  }

  .heading-two {
    font-family: ClashDisplay-700;
    color: #00bb34;
    font-size: 4rem;
    display: inline;
  }

  .green-gradient-bar {
    width: 20px;
    height: 8px;
    background: linear-gradient(99.93deg, #00bb34 6.12%, #afff7e 87.23%);
    border-radius: 4px;
    margin: 10px 0;
  }

  .num-land {
    height: 110px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    width: 400px;
    border-radius: 16px;
    background: linear-gradient(
      155.14deg,
      rgba(22, 25, 69, 0.15) -2.13%,
      rgba(37, 92, 120, 0.15) 136.58%
    );
    box-shadow: 0px 4px 49px rgba(0, 7, 72, 0.12);
    backdrop-filter: blur(10px);

    > div {
      width: fit-content;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      h5 {
        font-family: "Poppins";
        font-weight: 600;
        font-size: 32px;
        line-height: 48px;
        font-family: "Poppins";
        margin: 0;
      }
      p {
        font-family: "Poppins";
        font-style: normal;
        font-weight: 600;
        font-size: 14px;
        line-height: 20px;
        color: #a8abcb;
      }
    }
  }

  .seperator {
    height: 70%;
    width: 2px !important;
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const Banner = ({ totalList, totalRent }) => {
  return (
    <Wrapper>
      <div className="left-content">
        <div>
          <h1 className="heading-one">NFT Rental </h1>
          <h2 className="heading-two">Marketplace</h2>
        </div>
        <h3 className="my-8">Lend your NFT & borrow from others</h3>
        <div className="green-gradient-bar"></div>
        <h4 className="my-8 ">Owner of NFT Collection? </h4>
        <Button>List Projects</Button>
      </div>
      <div className="right-content">
        <div className="num-land">
          <div>
            <h5>{totalList}</h5>
            <p>Listed assets </p>
          </div>
          <div className="seperator"></div>
          <div>
            <h5>{totalRent}</h5>
            <p>Total rentals</p>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default Banner;
