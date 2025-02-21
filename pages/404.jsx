import React from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
import notFoundImg from "../public/images/404Svg.svg";
import Image from "next/image";


export default function Custom404() {
  const router = useRouter();

  const handleButtonClick = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
            <Image
              src={notFoundImg}
              alt="not found"
              className="!w-[300px] !h-[300px]"
            />

            <p className="text-[#7C7C7C] font-numans text-md">
              There are some unexpected errors, Try again by pressing refresh or
              try again later
            </p>
            <button
              type="button"
              className="flex h-10 p-3 md:p-4 mb-12 mt-6 justify-center items-center gap-1 mr-2 md:mr-0 rounded bg-green-4 shadow-lg text-white text-sm font-numans"
              style={{ boxShadow: "4px 4px 0px 0px #0A7128" }}
              onClick={handleButtonClick}
            >
              Refresh
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.36663 10.0007C2.36663 9.61405 2.05323 9.30065 1.66663 9.30065C1.28003 9.30065 0.966626 9.61405 0.966626 10.0007H2.36663ZM4.99915 3.33398L5.41962 3.89363L4.99915 3.33398ZM3.33329 4.99984L3.85113 5.47084L3.87322 5.44655L3.89294 5.42031L3.33329 4.99984ZM3.41887 0.837107C3.42059 0.450512 3.10859 0.135716 2.722 0.133991C2.3354 0.132267 2.0206 0.444266 2.01888 0.830861L3.41887 0.837107ZM2.71149 2.48874L2.0115 2.48562V2.48562L2.71149 2.48874ZM5.77816 5.55541L5.78128 6.2554H5.78128L5.77816 5.55541ZM7.43604 6.24802C7.82264 6.2463 8.13463 5.9315 8.13291 5.54491C8.13119 5.15831 7.81639 4.84631 7.42979 4.84804L7.43604 6.24802ZM3.05195 4.91954L2.49836 5.34796L2.49836 5.34796L3.05195 4.91954ZM3.34736 5.21496L2.91894 5.76854L2.91894 5.76854L3.34736 5.21496ZM0.966626 10.0007C0.966626 14.9896 5.01099 19.034 9.99996 19.034V17.634C5.78418 17.634 2.36663 14.2164 2.36663 10.0007H0.966626ZM9.99996 19.034C14.9889 19.034 19.0333 14.9896 19.0333 10.0007H17.6333C17.6333 14.2164 14.2157 17.634 9.99996 17.634V19.034ZM19.0333 10.0007C19.0333 5.01168 14.9889 0.967318 9.99996 0.967318V2.36732C14.2157 2.36732 17.6333 5.78488 17.6333 10.0007H19.0333ZM9.99996 0.967318C7.96677 0.967318 6.08865 1.63987 4.57867 2.77434L5.41962 3.89363C6.69546 2.93507 8.2804 2.36732 9.99996 2.36732V0.967318ZM4.57867 2.77434C3.89525 3.28781 3.28712 3.89594 2.77365 4.57937L3.89294 5.42031C4.3272 4.84232 4.84162 4.32789 5.41962 3.89363L4.57867 2.77434ZM2.01888 0.830861L2.0115 2.48562L3.41148 2.49187L3.41887 0.837107L2.01888 0.830861ZM5.78128 6.2554L7.43604 6.24802L7.42979 4.84804L5.77503 4.85542L5.78128 6.2554ZM2.0115 2.48562C2.00863 3.12898 2.00515 3.67065 2.05266 4.10575C2.10172 4.55492 2.21228 4.9783 2.49836 5.34796L3.60553 4.49112C3.54232 4.40945 3.47972 4.27724 3.44439 3.95376C3.40753 3.61621 3.40847 3.16815 3.41148 2.49187L2.0115 2.48562ZM5.77503 4.85542C5.09875 4.85844 4.6507 4.85938 4.31314 4.82251C3.98966 4.78719 3.85745 4.72458 3.77578 4.66137L2.91894 5.76854C3.2886 6.05462 3.71198 6.16518 4.16115 6.21424C4.59625 6.26175 5.13792 6.25828 5.78128 6.2554L5.77503 4.85542ZM2.49836 5.34796C2.57504 5.44704 2.65943 5.53974 2.75071 5.62522L3.70768 4.60335C3.67074 4.56876 3.63658 4.53124 3.60553 4.49112L2.49836 5.34796ZM2.75071 5.62522C2.80446 5.67556 2.8606 5.72339 2.91894 5.76854L3.77578 4.66137C3.75215 4.64309 3.72943 4.62373 3.70768 4.60335L2.75071 5.62522ZM2.81545 4.52884L2.71135 4.64329L3.74704 5.58529L3.85113 5.47084L2.81545 4.52884Z"
                  fill="#F1FCF3"
                />
              </svg>
            </button>
          </div>
  );
}
