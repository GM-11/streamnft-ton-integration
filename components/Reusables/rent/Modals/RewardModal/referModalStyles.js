import styled from "styled-components";

export const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
  min-height: 450px;
  gap: 0.5rem;

  .image-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
    background:#2929294D;
    width: 286px;
    padding: 16px 16px 16px 16px;
    border-radius: 16px;
    row-gap: 0.45rem;
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
          font-family: Numans;
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
`;
