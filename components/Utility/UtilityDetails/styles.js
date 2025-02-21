import styled from "styled-components";

export const Wrapper = styled.div`
  .inner-wrapper {
    color: #fff;
    justify-content: start;
    align-items: center;
    width: 100%;
    height: 196px;
    display: flex;
    gap: 1.5rem;

    .header-contents {
      display: flex;
      flex-direction: column;

      .title-line-with-icons {
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      h1 {
        font-family: Numans;
        font-size: 23px;
        color: #f1fcf3;
        line-height: normal;
      }

      p {
        font-family: Numans;
        font-weight: 400;
        font-size: 16px;
        color: #7c7c7c;
      }

      .icons-wrapper {
        height: 24px;
        width: fit-content;
        display: flex;
        margin: 0 1rem;

        .icon-wrapper {
          height: 24px;
          width: 24px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: transparent;
          border-radius: 50%;
          border: 0.6px solid #23963e;
          margin-right: 1rem;
          cursor: pointer;

          &:hover {
            background: #30b750;
            transform: scale(1.1, 1.1);
          }

          img {
            height: 12px;
            width: 14px;
            object-fit: fill;
          }
        }
      }

      .details-wrapper {
        height: 70px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: start;
        column-gap: 1.4rem;

        .detail {
          width: fit-content;
          padding-right: 1rem;

          h5 {
            font-style: normal;
            font-weight: 400;
            font-size: 1rem;
            color: #ffffff;
          }

          h4 {
            font-size: 16px;
            color: #8fe6a4;
            white-space: nowrap;
          }
        }

        .seperator {
          height: 35px;
          width: 2px;
          background: #a8abcb;
          opacity: 0.2;
          transform: rotate(15deg);
        }
      }
    }
  }
`;
