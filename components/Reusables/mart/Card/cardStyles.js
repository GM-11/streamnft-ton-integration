import styled from "styled-components";

export const LendRentWrapper = styled.div`
  height: 100%;
  flex-grow: 1;
  cursor: pointer;
  background: #1d1d1d;
  box-shadow: 0px 4px 0px 0px #252525;
  border-radius: 12px;
  position: relative;
  padding-bottom: 0.5rem;
  cursor: pointer;
  font-size: 12px !important;

  @media screen and (min-width: 768px) {
    font-size: 16px !important;
  }

  .h-128 {
    height: 128px;
  }

  .w-276 {
    width: 276px;
  }
  .lendCTA {
    text-align: center;
  }

  .image-position {
    object-fit: cover;
    object-position: center;
  }
  > img {
    height: 140px;
    width: 253px;
    object-fit: cover;
    object-position: center;
    border-width: 8px;
    border-color: #1d1d1d;
    border-radius: 12px;
  }

  .card-text-section {
    height: fit-content;
    width: 100%;
    padding: 0 0.5rem;
    margin: 0.5rem 0;
    font-family: "Numans";
    font-weight: 400;
    line-height: 18.8px;

    .card-text {
      height: fit-content;
      width: 100%;
      margin: 0.75rem 0;
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      .name-text {
        color: #ffffff;
        font-family: Numans;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
        font-size: 13px;
      }

      .fixed-duration-text {
        color: #8fe6a4;
        font-family: "Poppins";
        margin-top: 2px;
      }

      > div {
        width: 100%;
        display: flex;
        justify-content: space-between;
        margin-top: 0.5rem;

        .owner-text {
          font-family: "Poppins";
          font-style: normal;
          font-weight: 400;
          line-height: 8px;
          color: #ffffff;
        }

        span {
          font-family: "Poppins";
          font-style: normal;
          font-weight: 400;
          font-size: 12px;
          line-height: 18px;
          color: #19fb9b;
        }
      }
    }

    .other-card-text {
      height: fit-content;
      width: fit-content;
      display: flex;
      flex-direction: column;
      margin: 5px 0;
      margin-bottom: 10px;

      h5 {
        font-family: Numans;
        font-size: 14px;
        line-height: 18px;
        color: #8fe6a4;
      }
    }

    .button-section {
      height: fit-content;
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      column-gap: 3px;

      .button {
        height: fit-content;
        width: fit-content;
        padding: 0.875rem 1.8rem;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: "Poppins";
        font-style: normal;
        font-weight: 600;
        font-size: 0.875rem;
        line-height: 1.25rem;
        color: #a8abcb;
        margin-left: auto;
      }
    }
    .home-card-text {
      height: fit-content;
      width: 100%;
      display: flex;
      align-items: center;

      h5 {
        font-family: "Poppins";
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        line-height: 24px;
        color: #a8abcb;
        span {
          color: #ffffff;
        }
      }

      .dot {
        height: 3px;
        width: 3px;
        border-radius: 50%;
        background: #ffffff;
        margin: 0 0.5rem;
      }
    }
  }

  .video-rectangle {
    width: 400px;
    height: 200px;
  }
`;

export const LandingBottomCardWrapper = styled.div`
  height: fit-content;
  width: 350px;
  cursor: pointer;
  background: linear-gradient(
    155.14deg,
    rgba(0, 187, 52, 1),
    rgba(175, 255, 126, 1)
  );
  padding: 2px;
  position: relative;
  border-radius: 16px;

  .bg-image {
    height: 150px;
    width: 100%;
    object-fit: cover;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
  }
  .round-image {
    height: 72px;
    width: 72px;
    border-radius: 50%;
    object-fit: contain;
    position: absolute;
    top: calc(50% - 30px);
    left: calc(50% - 36px);
  }

  .text-wrapper {
    height: 100px;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: rgb(20, 20, 20);
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
    color: #fff;

    h1 {
      font-family: ClashDisplay-600;
      font-style: normal;
      font-size: 1.5rem;
      line-height: 1.875rem;
      padding: 1rem;
      padding-bottom: 0;
    }

    > div {
      display: flex;
      align-items: center;
      padding: 0.875rem 1.5rem;

      p,
      span {
        font-family: "Poppins";
        font-style: normal;
        font-weight: 400;
        font-size: 0.7rem;
        color: #a8abcb;
      }
      span {
        font-weight: 600;
        margin: 0 2px;
        font-size: 0.8rem;
        color: #00bb34;
      }
    }

    .dot {
      height: 5px;
      width: 5px;
      border-radius: 50%;
      background: #00bb34;
      margin: 0 5px;
    }
  }
`;

export const LandingTopCardWrapper = styled.div`
  width: 350px;
  height: fit-content;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(
    155.14deg,
    rgba(0, 187, 52, 1),
    rgba(175, 255, 126, 1)
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5px;
  border-radius: 16px;

  h1 {
    font-family: ClashDisplay-600;
    font-style: normal;
    font-size: 1.5rem;
    line-height: 1.875rem;
    padding: 1.5rem;
    padding-bottom: 0;
  }

  img {
    height: 280px;
    width: 100%;
    object-fit: cover;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
  }

  .text-wrapper {
    width: 100%;
    height: 120px;
    background: rgb(20, 20, 20);
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;

    > div {
      display: flex;
      align-items: center;
      padding: 0.875rem 1.5rem;

      p,
      span {
        font-family: "Poppins";
        font-style: normal;
        font-weight: 400;
        font-size: 0.7rem;
        color: #a8abcb;
      }
      span {
        font-weight: 600;
        margin: 0 2px;
        font-size: 0.8rem;
        color: #00bb34;
      }
    }

    .dot {
      height: 5px;
      width: 5px;
      border-radius: 50%;
      background: #00bb34;
      margin: 0 5px;
    }
  }
`;
