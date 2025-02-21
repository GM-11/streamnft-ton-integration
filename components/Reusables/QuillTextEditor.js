// import React from "react";
// import dynamic from "next/dynamic";
// import { useFormContext, Controller } from "react-hook-form";
// import "react-quill/dist/quill.snow.css";

// const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// const QuillTextEditor = ({ field, placeholder }) => {
//   const { control } = useFormContext();

//   return (
//     <div className="mb-4">
//       <Controller
//         name={field}
//         control={control}
//         rules={{ required: "Description is required" }}
//         render={({ field }) => (
//           <ReactQuill
//             {...field}
//             placeholder={placeholder}
//             theme="snow"
//             className="h-52 bg-gray-800 text-white"
//           />
//         )}
//       />
//     </div>
//   );
// };

// export default QuillTextEditor;
