import styled from "styled-components";

export const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  padding-top:1rem;
  min-height: 350px;
 
  .extra-pad-for-no-label {
    margin-top: 2rem;
    padding: 0 0.75rem 0 0.75rem;
  }

  .w-70{
    width: 70%
  }

  .half-input-wrapper {
    width: 50%;
    display: inline-block;
  }

  .reward-input{
    padding: 0 0;
  }
  .duration-input-wrapper {
    height: 60px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0.5rem 0 0.5rem;
    background:#191919;
    border-radius: 16px;
    > .seperator {
    height: 30px;
    width: 3px;
    background: linear-gradient(
      355.02deg,
      rgba(255, 255, 255, 0.183) -16.77%,
      rgba(255, 255, 255, 0) 131.72%
    );
    border-radius: 16px;
  }
  }
  .image-container {
    max-height:400px;
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
    background:#2929294D;
    width: 80%; 
    max-width: 216px; 
    padding: 16px 16px 0 16px;
    border-radius: 16px;
    row-gap: 0.5rem;
    margin-bottom:10px;

    > img {
      height: 180px;
      width: 180px;
      border-radius: 16px;
    }

    > .collection-name {
      padding-left: 16px;
      text-align: left;
      font-family: Numans;
      font-size: 20px;
      color: white;
      overflow-wrap: break-word;
      width: 200px;
    }

    > span {
      padding-left: 10px;
      text-align: left;
      font-family: Numans;
      font-size: 12px;
      color: #8FE6A4;
      overflow-wrap: break-word;
      width: 200px;
      font-weight: 500;
      line-height: normal;
      align-self: stretch;

      > .owner-address-label {
        color: #525252;
      }

      > .owner-address-value {
        color: white;
      }
    }
  }

  .wallet-row {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 10px;
    background:#191919;
    height: 70px;
    border-radius: 16px;
    font-family: Numans;
    font-style: normal;
    font-size: 0.875rem;
    line-height: 1.375rem;
    color: #8d8d8d;
    margin-bottom: 1rem;

    button {
        width: 40%;
        padding: 12px 24px;
        border-radius: 16px;
        background: #FFFFFF0A;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }

    input {
        width: 60%;
        &::placeholder {
          color: #8d8d8d;
          font-family: Numans;
        }
      }
    }

  }
  
  .numans-label {
    font-family: Numans;
  }

  .price-container{
    > h5 {
      width: 100%
      font-family: Numans;
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      color: #ffffff;
    }
  }
  .lend-modal-content {
    width: 70%;
    height: calc(100% - 20px);
    overflow-y: auto;
    margin: 0 20px;
    padding: 0 20px 0 20px;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    gap:0.5rem;

    > h5 {
      font-family: Numans;
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      color: #ffffff;
    }

    .content-row {
      width: 100%;
      display: flex;
      justify-content: space-between;

      > h5 {
        font-family: Numans;
        font-style: normal;
        font-weight: 400;
        color: #ffffff;
        font-size: 20px;
        line-height: 130%; 
        align-self: stretch;
      }

      .contract-selection {
        height: 60px;
        width: 100%;
        padding: 16px;
        border-radius: 16px;
        display: flex;
        background:#191919;
      }

      .share-section {
        height: fit-content;
        width: 48%;

        .share-input-wrapper {
          display: flex;
          align-items: center;
          height: 60px;
          width: 100%;
          display: flex;
          > h5 {
            margin: auto;
          }
        }
      }
      .calculated-rent-price-section {
        height: 60px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-around;
        > h5 {
          font-family: Numans, sans-serif;
          font-style: normal;
          font-weight: 600;
          font-size: 14px;
          line-height: 20px;
          color: #ffffff;
        }
      }
      
      .address-input {
        margin-top: 0;
        background:#191919;
        padding: 10px;
        border-radius: 16px;
        text-indent: 10px;
      }

      .sol-address-input {
        height: ${(props) => (props.openSolAddress ? "60px" : "0")};
        transition: all 0.2s ease-in;
        width: 200px;
      }
    }

    .time-input-row {
      position: relative;
      width: 100%;
      margin-bottom: 1rem;
    }
  }
`;

export const SelectionOption = styled.div`
  height: 100%;
  width: 60%;
  cursor: pointer;
  transition: all 0.2s ease-in;
  background: ${(props) => (props.selected ? "rgba(255,255,255,0.1)" : "none")};
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem 0;

  > h5 {
    font-family: Numans, sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 20px;
    padding: 0 5px;
    color: ${(props) => (props.selected ? "#8FE6A4" : "#c4cac8")};
  }
`;

export const TimeInput = styled.div`
  transition: all 0.2s ease-in;
  width: 55%;
  height: 60px;
  display: ${(props) => (props.show ? "flex" : "none")};
  justify-content: space-between;
  background: #191919;
  border-radius: 16px;

  @media screen and (max-width: 768px) {
    width: 100%;
  }

  .auto-calculated-wrapper {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1px;

    input {
      width: 70%;
      &::placeholder {
        font-family: Numans;
        font-size: 12px;
        color: #c4cac8;
      }
    }

    h5 {
      font-family: Numans;
      color: white;
      padding: 0 10px;
    }
  }

  .time-input-wrapper {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 5px;

    input {
      width: 50%;
      &::placeholder {
        font-family: Numans;
        font-size: 12px;
        color: #c4cac8;
      }
    }

    .seperator {
      height: 30px;
      width: 3px;
      background: linear-gradient(
        355.02deg,
        rgba(255, 255, 255, 0.183) -16.77%,
        rgba(255, 255, 255, 0) 131.72%
      );
      border-radius: 16px;
    }
  }
`;

export const ShareSectionWrapper = styled.div`
  padding: 0 5px;
  transition: all 0.2s ease-in;
  height: ${(props) =>
    props.contractType === "hybrid" || props.contractType === "revenue"
      ? "120px !important"
      : "0 !important "};
  margin-bottom: ${(props) =>
    props.contractType === "hybrid" || props.contractType === "revenue"
      ? "2rem !important"
      : "0 !important "};
  overflow: hidden;
`;
