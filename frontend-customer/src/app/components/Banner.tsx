"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

const Banner = () => {
  const images = [
    "/banner/b1.jpg",
    "/banner/b2.jpg",
    "/banner/b3.jpg",
    "/banner/b4.jpg",
    "/banner/b5.jpg",
    "/banner/b6.jpg",
    "/banner/b7.jpg",
    "/banner/b8.jpg",
    "/banner/b9.jpg",
    "/banner/b10.jpg",
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
