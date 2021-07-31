import React from "react";

// components

import IndexNavbar from "components/Navbars/IndexNavbar.js";

import Footer from "components/Footers/Footer.js";

export default function Auth({ children }) {
  return (
    <>
      <IndexNavbar />
      <main className="flex-grow">
        <section className="w-full h-full min-h-screen flex flex-col">
          <section className="flex-grow">{children}</section>
          <Footer />
        </section>
      </main>
    </>
  );
}
