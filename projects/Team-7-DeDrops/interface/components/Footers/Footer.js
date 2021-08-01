import React from "react";

export default function Footer() {
  return (
    <>
      <footer className="relative bg-blueGray-200 pt-8 pb-6 h-48">
        <div
          className="bottom-auto top-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden -mt-20 h-20"
          style={{ transform: "translateZ(0)" }}
        ></div>
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap text-center lg:text-left">
            <div className="w-full lg:w-6/12 px-4">
              <h4 className="text-xl font-semibold">Let's DeDrops!</h4>
              <h5 className="text-sm mt-0 mb-2 text-blueGray-600">
                基于链上数据的去中心化空投平台
              </h5>
            </div>

            <div className="w-full lg:w-6/12 px-4">
              <div className="flex flex-wrap items-top mb-6">
                <div className="ml-auto">
                  <a
                    href="https://twitter.com/includeleec/status/1420988534895177728"
                    target="__blank"
                  >
                    <button
                      className="bg-white text-lightBlue-400 shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2"
                      type="button"
                    >
                      <i className="fab fa-twitter"></i>
                    </button>
                  </a>

                  <a
                    href="https://github.com/DeDrops/dedrops-interface"
                    target="__blank"
                  >
                    <button
                      className="bg-white text-blueGray-800 shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2"
                      type="button"
                    >
                      <i className="fab fa-github"></i>
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <hr className="my-6 border-blueGray-300" />
          <div className="flex flex-wrap items-center md:justify-between justify-center">
            <div className="w-full md:w-4/12 px-4 mx-auto text-center">
              <div className="text-sm text-blueGray-500 font-semibold py-1">
                Copyright © {new Date().getFullYear()} DeDrops
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
