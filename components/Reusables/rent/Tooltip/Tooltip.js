import React, { useState } from "react";
import { usePopper } from "react-popper";

const Tooltip = ({ children, tooltip, placement, withArrow = true }) => {
  const [visible, setVisible] = useState(false);

  const [referenceElement, setReferenceElement] = useState(null);

  const [popperElement, setPopperElement] = useState(null);

  const [arrowElement, setArrowElement] = useState(null);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [
      { name: "arrow", options: { element: arrowElement } },
      { name: "preventOverflow", enabled: false },
    ],
    placement: placement,
  });

  return (
    <>
      <button
        type="button"
        ref={setReferenceElement}
        onMouseEnter={() => {
          setVisible(true);
        }}
        onMouseLeave={() => {
          setVisible(false);
        }}
      >
        {children}
      </button>

      {visible && (
        <div
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
          className="z-[10000] rounded border px-2 py-1 text-xs text-white bg-gray-3 mt-1 max-w-24 !font-numans"
        >
          {tooltip}
          {withArrow && <div ref={setArrowElement} style={styles.arrow}></div>}
        </div>
      )}
    </>
  );
};

export default Tooltip;
