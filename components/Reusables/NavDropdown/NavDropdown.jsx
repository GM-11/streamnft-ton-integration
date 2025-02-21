import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

const NavDropdown = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-center py-2 px-1 text-[13px] rounded font-semibold text-green-2 hover:text-green-4"
      >
        {data?.label}
        <FaChevronDown
          className={`ml-2 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="absolute left-0 text-white w-48 mt-1 bg-green-4 rounded-md shadow-lg z-50">
          {data?.dropdownItems?.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="cursor-pointer px-4 py-2 text-sm flex items-center gap-2 hover:bg-green-2 hover:rounded-md"
              onClick={() => setIsOpen(false)}
            >
              {item.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default NavDropdown;
