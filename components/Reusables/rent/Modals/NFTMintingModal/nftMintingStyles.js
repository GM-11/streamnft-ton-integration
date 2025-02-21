import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  margin: 2rem 0;
  width: 100%;
  min-height: 250px;

  img {
    height: 250px;
    width: auto;
    margin-right: 2rem;
  }

  .content-section {
    height: 250px;

    width: 100%;

    .content-row {
      display: flex;
      justify-content: space-between;
      gap: 3rem;
      width: 80%;
      margin-bottom: 1rem;
    }

    h5 {
      font-family: "Poppins";
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      /* identical to box height, or 143% */

      color: #ffffff;
    }
    p {
      font-family: "Poppins";
      font-style: normal;
      font-weight: 600;
      font-size: 14px;
      line-height: 20px;
      text-align: right;
      /* identical to box height, or 143% */

      color: #ffffff;
    }
  }
`;
