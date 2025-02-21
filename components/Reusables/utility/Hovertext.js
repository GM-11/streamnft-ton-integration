import React, {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  position: relative;
  height: fit-content;
  width: fit-content;
`;
const HoverBox = styled.div`
  background-color: #00bb34;
  height: 40px;
  width: 150px;
  position: absolute;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 40px;

  .border {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 5px;
    left: 5px;
    border: 1px solid #00bb34;
    background-color: #050505;
    z-index: -1;
  }

  p {
    font-family: ClashDisplay-600 !important;
    color: #050505 !important;
  }

  &:before {
    content: "";
    height: 20px;
    width: 20px;
    position: absolute;
    top: -2px;
    left: calc(50% - 10px);
    transform: rotate(45deg);
    background-color: #00bb34;
    z-index: -1;
  }
`;

const Hovertext = ({ className, children }) => {
  const [open, setOpen] = useState(false);
  const [parentWidth, setParentWidth] = useState();
  const pref = useRef(null);

  useEffect(() => {
    setParentWidth(pref.current.offsetWidth);
  }, [pref]);

  return (
    <Fragment>
      <Wrapper ref={pref}>
        <p
          className={className}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {children}
        </p>
        {open && (
          <HoverBox
            style={{ left: (parentWidth - 150) / 2 }}
            className="hover-box"
          >
            <p className={className}>COMING SOON</p>
            <div className="border"></div>
          </HoverBox>
        )}
      </Wrapper>
    </Fragment>
  );
};

export default Hovertext;
