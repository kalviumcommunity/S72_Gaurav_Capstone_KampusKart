import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const shuffle = (array: (typeof squareData)[0][]) => {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

const squareData = [
  { id: 1,  src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&q=80" },
  { id: 2,  src: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=400&q=80" },
  { id: 3,  src: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=400&q=80" },
  { id: 4,  src: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=400&q=80" },
  { id: 5,  src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80" },
  { id: 6,  src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" },
  { id: 7,  src: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&q=80" },
  { id: 8,  src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=80" },
  { id: 9,  src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80" },
  { id: 10, src: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&q=80" },
  { id: 11, src: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&q=80" },
  { id: 12, src: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=80" },
  { id: 13, src: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&q=80" },
  { id: 14, src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80" },
  { id: 15, src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&q=80" },
  { id: 16, src: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&q=80" },
];

interface ImageSquareProps {
  src: string;
  id: number;
}

const ImageSquare = ({ src, id }: ImageSquareProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setHasError(true);
  }, [src]);

  return (
    <motion.div
      key={id}
      layout
      transition={{ duration: 1.5, type: "spring" }}
      className="w-full h-full rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 transition-colors duration-200 relative"
    >
      {!isLoaded && !hasError && (
        <div className="w-full h-full absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
      )}
      {hasError && (
        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <span className="text-gray-400 dark:text-gray-500 text-xs">Image unavailable</span>
        </div>
      )}
      <img
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        src={src}
        alt={`Campus life scene ${id}`}
      />
    </motion.div>
  );
};

export const ShuffleGrid = () => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(false);
  const [squares, setSquares] = useState(squareData);

  useEffect(() => {
    isMountedRef.current = true;
    shuffleSquares();
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const shuffleSquares = () => {
    if (!isMountedRef.current) return;
    setSquares(shuffle([...squareData]));
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        shuffleSquares();
      }
    }, 3000);
  };

  return (
    <div className="grid grid-cols-4 grid-rows-4 h-full gap-2 sm:gap-3">
      {squares.map((sq) => (
        <ImageSquare key={sq.id} src={sq.src} id={sq.id} />
      ))}
    </div>
  );
};

export const ShuffleHero = () => {
  return (
    <section className="w-full px-4 sm:px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 max-w-6xl mx-auto">
      {/* Left: text */}
      <div className="text-center md:text-left space-y-3 sm:space-y-4 md:space-y-5">
        {/* Badge: Modernized with dark mode support and premium letter-spacing */}
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-widest transition-colors duration-200">
          Your campus, simplified
        </span>
        
        {/* Main Heading: Full dark mode support with premium typography */}
        <h1
          className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-zinc-900 dark:text-zinc-50 leading-tight tracking-tight transition-colors duration-200"
          style={{ letterSpacing: "-0.02em" }}
        >
          Everything Campus, One App
        </h1>
        
        {/* Subtext: Accessible muted tones for both light and dark modes */}
        <p className="text-sm sm:text-base md:text-lg text-zinc-600 dark:text-zinc-400 max-w-md mx-auto md:mx-0 leading-relaxed transition-colors duration-200">
          Your all-in-one campus companion for navigation, events, news, lost & found, complaints, and more.
        </p>
        
        {/* CTA Buttons: Optimized with micro-interactions and enhanced accessibility */}
        <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 justify-center md:justify-start pt-1 sm:pt-2">
          {/* Primary CTA: Get Started */}
          <Link
            to="/signup"
            aria-label="Sign up for free account"
            className="min-h-[48px] px-6 sm:px-8 py-3 rounded-lg font-bold text-white bg-zinc-900 dark:bg-teal-600 hover:bg-zinc-800 dark:hover:bg-teal-500 active:bg-zinc-950 dark:active:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm sm:text-base text-center"
          >
            Get started
          </Link>
          
          {/* Secondary CTA: Log In */}
          <Link
            to="/login"
            aria-label="Log in to your account"
            className="min-h-[48px] px-6 sm:px-8 py-3 rounded-lg font-bold text-zinc-900 dark:text-zinc-50 bg-white dark:bg-gray-900 border-2 border-zinc-200 dark:border-gray-700 hover:bg-zinc-50 dark:hover:bg-gray-800 hover:border-zinc-300 dark:hover:border-gray-600 active:bg-zinc-100 dark:active:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm sm:text-base text-center"
          >
            Log in
          </Link>
        </div>
      </div>

      {/* Right: shuffle grid — hidden on mobile */}
      <div className="hidden md:block w-full">
        <div className="w-full aspect-square max-w-[420px] lg:max-w-[520px] mx-auto">
          <ShuffleGrid />
        </div>
      </div>
    </section>
  );
};
