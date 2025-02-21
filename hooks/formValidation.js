const formValidation = (currStep, methods) => {
  let isError = true;

  if (currStep === 0) {
    const formValues = methods.getValues();

    if (!!formValues?.title) {
      methods.setError("title", "");
    } else {
      methods.setError("title", {
        type: "manual",
        message: "This is a required field",
      });
      isError = false;
    }

    if (!formValues?.isCreator) {
      if (!!formValues?.collection?.tokenAddress) {
        methods.setError("collection", "");
      } else {
        methods.setError("collection", {
          type: "manual",
          message: "This is a required field",
        });
        isError = false;
      }
    }

    if (!!formValues?.description) {
      methods.setError("description", "");
    } else {
      methods.setError("description", {
        type: "manual",
        message: "This is a required field",
      });
      isError = false;
    }

    // if (formValues?.benefitType === "") {
    //   methods.setError("benefitType", {
    //     type: "manual",
    //     message: "This is a required field",
    //   });
    //   isError = false;
    // } else {
    //   methods.setError("benefitType", "");
    // }

    if (formValues?.industryType === "") {
      methods.setError("industryType", {
        type: "manual",
        message: "This is a required field",
      });
      isError = false;
    } else {
      methods.setError("industryType", "");
    }

    // if (formValues?.images?.length <= 0) {
    //   methods.setError("images", {
    //     type: "manual",
    //     message: "This is a required field",
    //   });
    //   isError = false;
    // } else {
    //   methods.setError("images", "");
    // }
  }

  if (currStep === 1) {
    const formValues = methods.getValues();

    if (formValues?.campaignMethod === "first_come") {
      if (formValues?.raffleStartDate !== "") {
        methods.setError("raffleStartDate", "");
      } else {
        methods.setError("raffleStartDate", {
          type: "manual",
          message: "This is a required field",
        });
        isError = false;
      }

      if (formValues?.raffleEndDate !== "") {
        methods.setError("raffleEndDate", "");
      } else {
        methods.setError("raffleEndDate", {
          type: "manual",
          message: "This is a required field",
        });
        isError = false;
      }
    } else {
      if (formValues?.raffleStartDate !== "") {
        methods.setError("raffleStartDate", "");
      } else {
        methods.setError("raffleStartDate", {
          type: "manual",
          message: "This is a required field",
        });
        isError = false;
      }

      if (formValues?.raffleEndDate !== "") {
        methods.setError("raffleEndDate", "");
      } else {
        methods.setError("raffleEndDate", {
          type: "manual",
          message: "This is a required field",
        });
        isError = false;
      }

      if (formValues?.raffleClaimDate !== "") {
        methods.setError("raffleClaimDate", "");
      } else {
        methods.setError("raffleClaimDate", {
          type: "manual",
          message: "This is a required field",
        });
        isError = false;
      }
    }

    if (formValues?.utilityType) {
      methods.setError("utilityType", "");
      // const fields = formValues?.utilityType?.data?.form;

      // for (const item of fields) {
      //   if (
      //     formValues[item.displayText] === undefined ||
      //     formValues[item.displayText] === ""
      //   ) {
      //     methods.setError(`${item}`, {
      //       type: "manual",
      //       message: "This is a required field",
      //     });

      //     isError = false;
      //   } else {
      //     methods.setError(`${item}`, "");
      //   }
      // }
    } else {
      methods.setError("utilityType", {
        type: "manual",
        message: "This is a required field",
      });
      isError = false;
    }

    if (formValues?.numberOfWinners !== "") {
      methods.setError("numberOfWinners", "");
    } else {
      methods.setError("numberOfWinners", {
        type: "manual",
        message: "This is a required field",
      });
      isError = false;
    }

    if (formValues?.estimatedPrize !== "") {
      methods.setError("estimatedPrize", "");
    } else {
      methods.setError("estimatedPrize", {
        type: "manual",
        message: "This is a required field",
      });
      isError = false;
    }
  }

  if (currStep === 2) {
    const formValues = methods.getValues();

    if (formValues?.formArray?.length <= 0) {
      methods.setError("formArray", {
        type: "manual",
        message: "Please select any one eligibility option from the menu",
      });
      isError = false;
    } else {
      methods.setError("formArray", "");
    }
  }

  return isError;
};

export default formValidation;
