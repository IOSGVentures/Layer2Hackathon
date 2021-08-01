/* eslint-disable react/jsx-no-target-blank */
import React from "react";
import MainLayout from "layouts/Main";

import CardNFTMint from "components/Cards/CardNFTMint";

export default function Mint() {
  return (
    <>
      <div className="flex pt-32 flex-wrap bg-white">
        <div className="w-full lg:w-8/12 px-4">
          <CardNFTMint />
        </div>
      </div>
    </>
  );
}

Mint.layout = MainLayout;
