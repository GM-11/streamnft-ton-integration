import FileUpload from "./FileUpload";
import Input from "./Input";

const RewardsOptionsComponent = ({ item, methods }) => {
  switch (item) {
    case "file": {
      return (
        <div className="w-full mt-6">
          <FileUpload methods={methods} name="File" />
          {/* {!!methods?.formState?.errors?.images && (
            <p className="text-remDays-block">
              {methods?.formState?.errors?.images?.message}
            </p> */}
          {/* )} */}
        </div>
      );
    }
    case "url": {
      return (
        <div className="w-full flex my-6">
          <Input
            reactHookFormRegister={{ ...methods.register("rewardOption") }}
            placeholder="Enter URL"
          />
        </div>
      );
    }
    case "genericCode": {
      return (
        <div className="w-full flex my-6">
          <Input
            reactHookFormRegister={{ ...methods.register("rewardOption") }}
            placeholder="Enter the General Code or voucher for the campaign reveal"
          />
        </div>
      );
    }
    default: {
      return null;
    }
  }
};

export default RewardsOptionsComponent;
