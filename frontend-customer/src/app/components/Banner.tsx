"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

const Banner = () => {
  const images = [
    "/item.png",
    "/item-2.png",
    "/item-3.png",
    "/item-4.png",
    "/item-5.png",
    "/item-6.png",
    "/item-7.png",
    "/item-8.png",
    "/item-9.png",
    "/item-10.png",
    "/item-11.png",
    "/item-12.png",
    "/item-13.png",
    "/item-14.png",
    "/item-15.png",
    "/item-16.png",
    "/item-17.png",
    "/item-18.png",
    "/item-19.png",
    "/item-20.png",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Initialize from localStorage or start from the beginning
  useEffect(() => {
    const savedIndex = localStorage.getItem("bannerIndex");
    if (savedIndex !== null) {
      setCurrentIndex(parseInt(savedIndex, 10)); // Load saved index from localStorage
    }
  }, []);

  // Update localStorage and increment index on an interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % images.length;
        localStorage.setItem("bannerIndex", nextIndex.toString()); // Save index to localStorage
        return nextIndex;
      });
    }, 6000); // Change every 6 seconds

    return () => clearInterval(interval); // Cleanup the interval on component unmount
  }, [images.length]);

  return (
    <div className="hidden sm:flex h-32 sm:h-64 relative overflow-hidden">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image src={image} alt="" fill className="object-cover" />
        </div>
      ))}
    </div>
  );
};

export default Banner;
