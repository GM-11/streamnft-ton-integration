import { FormProvider, useForm } from "react-hook-form";
import Test from "@/components/Test";

const index = () => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <Test />
    </FormProvider>
  );
};

export default index;
