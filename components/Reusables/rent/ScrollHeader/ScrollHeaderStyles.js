import styled from "styled-components";

export const Wrapper = styled.div`
  /* height: 150px; */
  width: 100%;
  margin-top: 15px;
margin-right: auto;
margin-bottom: auto;
margin-left: auto;
  display: flex;
  align-items: center;

  .scroll-block {
    text-align: right;
    max-width: 60%;
    white-space: nowrap;
    overflow-x: auto;
  }
`;

export const ImageBlock = styled.div`
  min-width: 48px;
  height: 48px;
  display: inline-block;
  flex-direction: row;
  padding: 10px;
  margin: auto 8px;
  justify-content: center;
  align-items: center;
  margin-bottom: 0px;
  border-radius: 8px;
  cursor: pointer;
  background: ${(props) =>
    props.selected ? "#30B750" : "rgba(245, 200, 200, 0.15)"};
  box-shadow: ${(props) =>
    props.selected ? "0px 4px 6px -1px rgba(0, 0, 0, 0.1) " : "none"};
  &:hover {
    background: #30B750;
    box-shadow: 0px 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
    > div {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      > img {
        height: 24px;
        width: 24px;
        border-radius: 50%;
        margin: auto;
      }
  }

  .all-block-section {
    display: flex;
    flex-direction: row;
    gap: 4px;
    padding: 0.5rem 0.1rem;
    border-radius: 8px;

    .all-block-bg {
      height: 24px;
      width: 24px;
      background: #175D2799;
      border-radius: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;

        > img {
          width: 8px;
          height: 8px;
          margin: auto 1px;
        }
      }
      
      > h5 {
        color: white;
        margin: 0.4rem;
      }
  }

  
`;
