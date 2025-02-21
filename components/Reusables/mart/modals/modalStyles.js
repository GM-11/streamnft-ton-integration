import styled from "styled-components";

export const Wrapper = styled.div`
  height: 100vh;
  width: 100vw;
  background: rgba(5, 7, 29, 0.8);
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-in;
  opacity: ${(props) => (props.open ? 1 : 0)};
  visibility: ${(props) => (props.open ? "visible" : "hidden")};
  z-index: 999;

  h5 {
    font-family: Numans;
    font-style: normal;
    font-size: 20px;
    line-height: 15px;
  }
`;
export const ModalBox = styled.div`
  height: fit-content;
  width: 850px;
  background: #121212;
  border: 1px solid #00bb34;
  border-radius: 16px;
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
  h5 {
    font-family: Numans;
    font-style: normal;
    font-size: 20px;
    line-height: 23.5px;
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

  input {
    height: 100%;
    width: 65%;
    background: none;
    border: none;
    color: #a8abcb;
    padding: 0 10px;
    &:focus {
      outline: none;
    }
    &::placeholder {
      color: #a8abcb;
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
  padding: 0 25px;
  cursor: pointer;

  .text-red {
    color: red;
  }
  .submit-button {
    height: 18px;
    width: fit-content;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #161945;
    border-radius: 33px;
    background-color: #19fb9b;
    font-family: "Poppins";
    font-style: normal;
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;

    &:hover {
      background: #30B750
    }
  }

`;
