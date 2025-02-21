import axios from "axios";
import React, { createContext, useEffect, useMemo, useState } from "react";
import utilityCalls from "@/services/utility/utilityCalls";
import nftCalls from "@/services/utility/nftCalls";

export const CreateUtilityContext = createContext();

export const CreateUtilityContextWrapper = ({ children }) => {
  const [optionsData, setOptionsData] = useState([]);
  const [error, setError] = useState("");
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [collectionsData, setCollectionsData] = useState([]);
  const [eligibilityOptions, setEligibilityOptions] = useState([]);

  const fetchData = async () => {
    try {
      const response = await utilityCalls.getAllStaticTypes();
      setOptionsData(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setOptionsLoading(false);
    }
  };

  const fetchUserCollections = async () => {
    const response = await nftCalls.getCollections();
    if (response instanceof Error) {
      console.error("Error", response);
    } else {
      setCollectionsData(
        response?.data?.map((el) => {
          return {
            ...el,
            name: el?.name ? el?.name : Math.random().toString(36).substring(2),
          };
        }) ?? []
      );
    }
  };

  useEffect(() => {
    fetchData();
    fetchUserCollections();
  }, []);

  const fetchOptionsBasedOnType = (type) => {
    const types =
      optionsData?.statisTypes?.find((el) => el?.title === type)?.types ?? [];

    return types?.map((el) => {
      return { label: el, value: el };
    });
  };

  const benefitTypeOptions = useMemo(() => {
    return fetchOptionsBasedOnType("BenefitType");
  }, [optionsData]);

  const industryTypeOptions = useMemo(() => {
    return fetchOptionsBasedOnType("IndustryType");
  }, [optionsData]);

  useEffect(() => {
    if (optionsData?.eligibilityOptions) {
      const newEligibilityOptions = optionsData.eligibilityOptions.map(
        function (el, idx) {
          return {
            title: el?.title,
            image_url: el?.image_url,
            options: el?.options?.map((el2) => {
              return {
                title: el2?.title,
                value: el2?.title,
                fields: {
                  heading: el2?.title,
                  title: el2?.displayText,
                  entries: "",
                  mandatory: false,
                  parentIndex: idx,
                  fieldKey: el?.title,
                  userInput: "",
                  form: el2?.form,
                  type: el2?.type,
                },
              };
            }),
          };
        }
      );
      setEligibilityOptions(newEligibilityOptions);
    }
  }, [optionsData]);

  const rewardsOptionsData = useMemo(() => {
    return (
      optionsData?.rewardTypes?.map((el) => {
        return {
          ...el,
        };
      }) ?? []
    );
  }, [optionsData]);

  return (
    <CreateUtilityContext.Provider
      value={{
        benefitTypeOptions,
        industryTypeOptions,
        eligibilityOptions,
        rewardsOptionsData,
        collectionsData,
        fetchUserCollections,
        setEligibilityOptions,
      }}
    >
      {children}
    </CreateUtilityContext.Provider>
  );
};
