import React, { useEffect, useState } from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

const PointsTable = ({ dataArray, handlePostRedirect }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(dataArray);
  }, [dataArray]);


  return (
    <div className="w-full overflow-x-auto">
      <div className="mt-4">
        <TableHeader />
        <TableRow data={data} handlePostRedirect={handlePostRedirect} />
      </div>
    </div>
  );
};

export default PointsTable;
