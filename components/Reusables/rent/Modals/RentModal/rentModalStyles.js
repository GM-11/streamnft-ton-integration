import styled from "styled-components";

export const Wrapper = styled.div`
  height: 80%;
  display: flex;
  width: 100%;
  min-height: 400px;

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


  .image-container {
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
    background:#2929294D;
    width: 350px;
    padding: 16px 16px 0 16px;
    border-radius: 16px;
    row-gap: 1rem;

    > img {
      height: 200px;
      width: 220px;
      border-radius: 16px;
    }

    > .collection-name {
      padding-left: 10px;
      text-align: left;
      font-family: Numans;
      font-size: 20px;
      color: white;
      width: 200px;
      line-height: 130%; 
      align-self: stretch;
    0}

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

  .content-section {
    height: calc(100% - 35px);
    margin: 0 20px;
    width: 70%;
    border-radius: 16px;
    padding: 0 16px 0 16px;
    
    > table {
      width: 100%;
      background:#2929294D;
      padding: 16px 0;
      font-family: Numans;
      border-radius: 16px;
      > tr {
        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        > th {
          padding: 10px 20px;
          padding-right: 40px;
          color: #989898;
          font-size: 14px;
          font-style: normal;
          font-weight: 500;
          line-height: normal;
        }
        > td {
          padding: 10px 30px;
          color: #fff;
          font-size: 14px;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
        }
      }
    }
  }
  .content-row {
    width: 80%;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .half-input-wrapper {
    width: 50%;
    display: inline-block;
  }
  .duration-input-wrapper {
    height: 60px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem;
    background:#191919;
    border-radius: 16px;

    .dropdown {
      height: 100%;
      width: 30%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
`;
