const Selector = ({ selectedButton, handleButtonClick }) => {
  return (
    <div className="flex flex-row gap-3 bg-[#191919] w-fit h-[54px] rounded-lg p-[8px] items-center justify-center px-4">
      <div
        className={`items-center justify-center flex font-numans whitespace-nowrap px-4  text-center text-[#525252] ${
          selectedButton === "quest"
            ? "text-[#8FE6A4] text-sm bg-white bg-opacity-[0.04] h-[42px] w-fit items-center justify-center  rounded-lg"
            : "text-xs"
        }`}
        onClick={() => {
          handleButtonClick("quest");
        }}
        style={{ cursor: "pointer" }}
      >
        <span
          style={{
            color: selectedButton === "quest" ? "#19FB9B" : "white",
          }}
        >
          Quest
        </span>
      </div>
      <div
        className={`items-center justify-center flex font-numans whitespace-nowrap px-4  text-center text-[#525252] ${
          selectedButton === "utility"
            ? "text-[#8FE6A4] text-sm bg-white bg-opacity-[0.04] h-[42px] w-fit items-center justify-center  rounded-lg"
            : "text-xs"
        }`}
        onClick={() => {
          handleButtonClick("utility");
        }}
        style={{ cursor: "pointer" }}
      >
        <span
          style={{
            color: selectedButton === "utility" ? "#19FB9B" : "white",
          }}
        >
          Utility
        </span>
      </div>
      <div
        className={`items-center justify-center flex font-numans px-4 text-center whitespace-nowrap text-[#525252] ${
          selectedButton === "space"
            ? "text-[#8FE6A4] text-sm bg-white bg-opacity-[0.04] h-[42px] w-fit items-center justify-center  rounded-lg"
            : "text-xs"
        }`}
        onClick={() => {
          handleButtonClick("space");
        }}
        style={{ cursor: "pointer", marginLeft: "10px" }}
      >
        <span
          style={{
            color: selectedButton === "space" ? "#19FB9B" : "white",
          }}
        >
          Space
        </span>
      </div>
    </div>
  );
};

export default Selector;
