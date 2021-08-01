/* eslint-disable react/jsx-no-target-blank */
import React from "react";

import IndexNavbar from "components/Navbars/IndexNavbar.js";

import CardAirdropApply from "components/Cards/CardAirdropApply";

import Footer from "components/Footers/Footer.js";

export default function Index() {
  return (
    <>
      <IndexNavbar fixed />

      <div className="flex pt-32 flex-wrap bg-white">
        <div className="w-full lg:w-8/12 px-4">
          <CardAirdropApply />
        </div>
      </div>
      <Footer />
    </>
  );
}
