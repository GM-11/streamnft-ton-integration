import styled from "styled-components";

export const Wrapper = styled.div`
  width: 100%;
  background: linear-gradient(99.93deg, #00bb34 6.12%, #afff7e 87.23%);

  .footer-inner-wrapper {
    height: 80px;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media screen and (max-width: 1280px) {
      padding: 0 5%;
    }
  }

  h5 {
    font-family: Poppins;
    font-style: normal;
    font-size: 1rem;
    line-height: 1.375rem;
    color: #0d0d0d;
    font-weight: 400;
    font-display: swap;
    font-style: normal;
  }

  .logo {
    display: flex;
    h5 {
      font-family: "Poppins";
      font-style: normal;
      font-weight: 600;
      font-size: 1.5rem;
      line-height: 2.2rem;
      color: #0d0d0d;
      margin-left: 10px;
    }
  }

  .icons-wrapper {
    display: flex;
    justify-content: space-between;

    .icon-wrapper {
      height: 36px;
      width: 36px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      background: #0d0d0d;
      margin: 0 0.5rem;
      cursor: pointer;

      img {
        height: 16px;
        width: 16px;
        object-fit: fill;
      }
    }
  }
`;
