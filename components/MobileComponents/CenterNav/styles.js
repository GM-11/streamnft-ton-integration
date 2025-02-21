import styled from "styled-components";

export const Wrapper = styled.div`
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .seperator {
    height: 35px;
    width: 2px;
    background: #a8abcb;
    opacity: 0.2;
    transform: rotate(15deg);
  }

  .totals-container {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .total-loans-text,
    .total-volume-text {
      margin: 20px;
      font-size: 4px;
    }
  }

  .search-wrapper {
    height: 60px;
    width: 400px;
    display: flex;
    align-items: center;
    padding: 0 1rem;

    img {
      height: 1.5rem;
      width: 1.5rem;
      object-fit: cover;
    }

    input {
      height: 60px;
      width: 240px;
      background: none;
      border: none;
      color: #8d8d8d;
      padding: 0 25px;
      font-size: 0.875rem;
      font-weight: 600;

      &::placeholder {
        color: #8d8d8d;
        font-weight: 600;
      }

      &:focus {
        outline: none;
      }
    }
  }
`;
