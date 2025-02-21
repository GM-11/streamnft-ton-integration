"use client";
import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const Loader = () => {
  return <div className="text-white grow w-full"> Loading ...</div>;
};

const DynamicExplore = dynamic(() => import("@/components/Explore.jsx"), {
  ssr: false,
});

const Explore = () => (
  <Suspense fallback={<Loader />}>
    <DynamicExplore />
  </Suspense>
);

export default Explore;
