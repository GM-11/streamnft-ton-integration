import { useState } from "react";
import ClickAwayListener from "@/components/Reusables/ClickAwayListener";

const DropdownPopper = ({
  title,
  className,
  topDivClassName,
  bottomDivClassName,
  items,
  onItemClick,
  image,
  isActive,
}) => {
  const [active, setActive] = useState(false);

  const toggleDropDown = () => {
    setActive(!active);
  };

  return (
    <ClickAwayListener onClickAway={() => setActive(false)}>
      <div className={`${className} relative`}>
        <div
          className={`h-fit w-fit px-4 py-1 flex gap-2 items-center  border-solid border-2 font-medium rounded-full text-white cursor-pointer ${topDivClassName} ${
            isActive
              ? "bg-green-4 border-green-4"
              : "bg-transparent border-gray-2"
          }`}
          onClick={toggleDropDown}
        >
          <img
            src={image}
            height={32}
            width={32}
            className="h-4 w-4 object-cover"
          />
          {title}
        </div>
        {active && (
          <div
            className={`${bottomDivClassName} absolute top-8 z-[10000] overflow-hidden`}
          >
            <ul
              className="list-none rounded-lg my-2 bg-whitish-green border border-solid border-[#dddddd]  px-2 py-1"
              style={{
                border: "1px solid #23963E",
                boxShadow: "0px 4px 0px 0px #1F7634",
              }}
            >
              {items.map((item, index) => (
                <li
                  className="my-2 p-2 hover:bg-seperator cursor-pointer whitespace-nowrap text-black border-b border-solid border-green-7"
                  onClick={() => {
                    onItemClick(index);
                    setActive(false);
                  }}
                >
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ClickAwayListener>
  );
};

export default DropdownPopper;
