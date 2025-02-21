import { utilityContext } from "@/context/UtilityContext";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext } from "react";

const CustomLink = ({ href, children, ...props }) => {
  const router = useRouter();
  const { setShowPageSwitchModal, setClickedLink } = useContext(utilityContext);

  return (
    <Link
      href={href}
      onClick={(e) => {
        e.preventDefault();
        if (router.pathname.includes("manage/[id]")) {
          setShowPageSwitchModal(true);
          setClickedLink(href);
          router.events.emit("routeChangeError");
        } else {
          router.push(href);
        }
      }}
      {...props}
    >
      {children}
    </Link>
  );
};

export default CustomLink;
