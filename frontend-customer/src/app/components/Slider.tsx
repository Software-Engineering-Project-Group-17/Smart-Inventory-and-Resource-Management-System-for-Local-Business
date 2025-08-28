"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { transform } from "next/dist/build/swc";

const slides = [
  {
    id: 1,
    title: "MANCHANAYAKE",
    description: "NEW PARTNERSHIP WITH",
    img: "/Golf4.png",
    url: "/list?cat=golf",
    bg: "bg-gradient-to-r from-orange-300 to-orange-800",
  },
  {
    id: 2,
    title: "GOLF",
    description: "NEW PARTNERSHIP WITH",
    img: "/Golf2.png",
    url: "/list?cat=golf",
    bg: "bg-gradient-to-r from-lime-400 to-gray-50",
  },
  {
    id: 3,
    title: "GOLF",
    description: "NEW PARTNERSHIP WITH",
    img: "/Golf3.png",
    url: "/list?cat=golf",
    bg: "bg-gradient-to-r from-amber-50 to-sky-800",
  },
];

const Slider = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const [current, setCurrent] = useState(0);

  return (
    <div className="h-[calc(100vh-80px)] overflow-hidden">
      <div
        className="w-max h-full flex transition-all ease-in-out duration-1000"
        style={{ transform: `translateX(-${current * 100}vw)` }}
      >
        {slides.map((slide) => (
          <div
            className={`${slide.bg} w-screen h-full flex flex-col xl:flex-row`}
            key={slide.id}
          >
            {/* TEXT CONTAINER */}

            <div className="h-1/2 xl:h-full xl:w-1/2 flex flex-col items-center justify-center gap-8 2xl:gap-12 text-center">
              <h2 className="text-xl lg:text-3xl 2xl:text-5xl">
                {slide.description}
              </h2>
              <h1 className="text-5xl lg:text-6xl 2xl:text-8xl font-semibold">
                {slide.title}
              </h1>
              <Link href={slide.url}>
                <button className="rounded-md bg-black py-3 px-4 text-white">
                  SHOP NOW
                </button>
              </Link>
            </div>

            {/* IMAGE CONTAINER */}

            <div className="h-1/2 xl:h-full xl:w-1/2 relative">
              <Image
                src={slide.img}
                alt=""
                fill
                sizes="100%"
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="absolute left-1/2 bottom-8 flex gap-4 transform -translate-x-1/2">
        {slides.map((slide, index) => (
          <div
            className={`w-3 h-3 rounded-full ring-1 ring-gray-500 curser-pointer flex items-center justify-center ${
              current === index ? "scale-150" : ""
            }`}
            key={slide.id}
            onClick={() => setCurrent(index)}
          >
            {current === index && (
              <div className="w-[6px] h-[6px] rounded-full bg-gray-500"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slider;
