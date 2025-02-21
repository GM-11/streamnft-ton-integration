import styled from "styled-components";

export const Wrapper = styled.div`
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-in;
  font-family: "Numans", sans-serif;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;

  @media screen and (max-width: 768px) {
    align-items: flex-end;
  }
`;
export const ModalBox = styled.div`
  height: fit-content;
  width: 80%;
  max-width: 850px;
  border-radius: 1rem;
  overflow: hidden;
  font-family: "Numans", sans-serif;

  @media screen and (max-width: 768px) {
    min-width: 100%;
    border-radius: 1rem 1rem 0 0;
  }
`;
export const ModalHeader = styled.div`
  height: 40px;
  width: 100%;
  padding: 1.8rem 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  font-family: "Numans", sans-serif;

  h5 {
    font-style: normal;
    font-weight: 600;
    font-size: 1.5rem;
    line-height: 2.25rem;
    color: #ffffff;
  }
`;
export const Closebutton = styled.div`
  cursor: pointer;
`;
export const ModalBody = styled.div`
  height: calc(100% - 120px);
  width: 100%;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  padding: 0 40px;
  /* overflow: hidden; */
  font-family: "Numans", sans-serif;

  input {
    height: 100%;
    width: 75%;
    background: none;
    border: none;
    color: #a8abcb;
    padding: 0 10px;
    &:focus {
      outline: none;
    }
    &::placeholder {
      color: #fff;
    }

    .seperator {
      height: 40px;
      width: 2px;
      background: linear-gradient(
        355.02deg,
        rgba(255, 255, 255, 0.183) -16.77%,
        rgba(255, 255, 255, 0) 131.72%
      );
      border-radius: 16px;
    }
  }
`;
export const ModalFooter = styled.div`
  height: 60px;
  width: 100%;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 25px;
  cursor: pointer;
  font-family: "Numans", sans-serif;

  .submit-button {
    height: 18px;
    width: fit-content;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #161945;
    border-radius: 33px;
    background-color: #19fb9b;
    font-family: "Numans";
    font-style: normal;
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;

    &:hover {
      background: #30b750;
    }
  }

  #button {
    margin-let: 60px;
  }
`;
