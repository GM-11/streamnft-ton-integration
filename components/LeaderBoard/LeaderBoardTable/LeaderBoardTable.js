import React, { useEffect, useState } from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

const LeaderBoardTable = ({ dataArray }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(dataArray);
  }, [dataArray]);

  console.log({dataArray})

  return (
    <div className="w-full overflow-x-auto">
      <div className="mt-4 w-full  !text-xs md:!text-sm">
        <TableHeader />
        <TableRow data={data} />
      </div>
    </div>
  );
};

export default LeaderBoardTable;
