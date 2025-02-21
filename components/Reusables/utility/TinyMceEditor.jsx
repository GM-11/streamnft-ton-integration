import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";

const TinyMceEditor = (props) => {
  const editorRef = useRef(null);

  return (
    <>
      <Editor
        onEditorChange={props.field.onChange}
        apiKey="dhp0td8ty3y0f2asol9b08btb7berpr30524fs2a3cpq9icm"
        onInit={(evt, editor) => (editorRef.current = editor)}
        value={props.field.value}
        init={{
          selector: "textarea",
          placeholder: props?.placeholder ?? "Type something here",
          height: 250,
          menubar: false,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "code",
            "help",
            "wordcount",
          ],
          skin_url: "/skins/ui/utility",
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help",
          branding: false,
          content_style:
            "body { font-family:Poppins,Arial,sans-serif; font-size:16px; color:#ffffff }",
        }}
      />
    </>
  );
};

export default TinyMceEditor;
