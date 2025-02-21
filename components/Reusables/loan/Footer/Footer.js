import React from "react";
import footerIcon from "../../../../public/images/footerlogo.png";
import discordIcon from "../../../../public/images/discord.svg";
import twitterIcon from "../../../../public/images/twitter.svg";
import Image from "next/image";
import Link from "next/link";
import logoImage from "../../../../public/images/eduverseLogo.svg";

const Footer = () => {
  const currentYear = new Date().getFullYear(); 

  return (
    <>
      <div className="w-full bg-[#DFF9E5] mt-4">
        <div className="footer-inner-wrapper max-w-90vw mx-auto flex flex-col justify-center items-center md:flex-row md:justify-between md:items-center min-h-[5rem] px-4 md:px-[5%]">
          <div className="flex items-center mb-4 md:mb-0">
            {/* <Image src={footerIcon} alt="logo" /> */}
            {/* <h5 className="font-normal !font-serif text-2xl text-[#0d0d0d] ml-2">
              StreamNFT
            </h5> */}
            <Image
              src={logoImage}
              alt="Desktop Logo"
              className="hidden sm:block h-9 w-auto"
              onClick={() => router.push("/")}
            />
          </div>
          <h5 className="font-normal text-md text-[#1a4d27] font-clashDisplay mb-4 md:mb-0">
            &copy; {currentYear} StreamNFT. All Rights Reserved.
          </h5>
          <div className="flex flex-row gap-2 items-center md:mb-0 mb-2">
            <div className="flex flex-col gap-2 items-center">
              <Link
                href={`${
                  process.env.NEXT_PUBLIC_MAIN_URL ?? "https://streamnft.tech/"
                }privacy-policy`}
                className="font-normal text-xs text-[#1a4d27]"
              >
                Privacy policy
              </Link>
              <Link
                href={`${
                  process.env.NEXT_PUBLIC_MAIN_URL ?? "https://streamnft.tech/"
                }terms-and-condition`}
                className="font-normal text-xs text-[#1a4d27]"
              >
                Terms and Conditions
              </Link>
            </div>
            <div className="icon-wrapper h-7 w-7 flex justify-center items-center rounded-full bg-gray-900 cursor-pointer">
              <Image src={twitterIcon} alt="twitter" width={16} height={16} />
            </div>
            <div className="icon-wrapper h-7 w-7 flex justify-center items-center rounded-full bg-gray-900 cursor-pointer">
              <Image src={discordIcon} alt="discord" width={16} height={16} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
