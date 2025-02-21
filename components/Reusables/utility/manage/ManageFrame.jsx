"use client";
import React, { useContext, useState } from "react";
import Table from "./table/ManageTable";
import CreateSpacePage from "@/components/Utility/Create/components/space/SpaceForm";
import { SpaceContext } from "@/context/SpaceContext";

const ManageFrame = ({ data, selectedButton, loading }) => {
  const utilityData = data?.utility;
  const spaceData = data?.space;
  const questData = data?.quest;

  const [selectedItem, setSelectedItem] = useState(null);

  const { spaceLoading, showSpaceForm, setShowSpaceForm } =
    useContext(SpaceContext);

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setShowSpaceForm(true);
  };

  const handleSuccess = () => {
    setShowSpaceForm(false);
    setSelectedItem(null);
  };
  return (
    <>
      <div>
        {showSpaceForm ? (
          <CreateSpacePage item={selectedItem} onSuccess={handleSuccess} />
        ) : (
          <>
            <div
              className={`w-full ${
                selectedButton === "utility" ? "block" : "hidden"
              }`}
            >
              <Table
                data={utilityData}
                columns={[
                  "Name",
                  "Description",
                  "Total Entries",
                  "Status",
                  " ",
                ]}
                selectedButton={selectedButton}
                loading={loading}
                onEdit={handleEditItem}
              />
            </div>

            <div
              className={`w-full ${
                selectedButton === "quest" ? "block" : "hidden"
              }`}
            >
              <Table
                data={questData}
                columns={[
                  "Name",
                  "Description",
                  "Total Entries",
                  "Status",
                  " ",
                ]}
                selectedButton={selectedButton}
              />
            </div>

            <div
              className={`w-full ${
                selectedButton === "space" ? "block" : "hidden"
              }`}
            >
              <Table
                data={spaceData}
                columns={[
                  "Name",
                  "Description",
                  "Utility Count",
                  "Quest Count",
                  "Category",
                  " ",
                ]}
                selectedButton={selectedButton}
                loading={spaceLoading}
                onEdit={handleEditItem}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ManageFrame;
