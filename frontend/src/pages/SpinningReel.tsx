import React, { useState, useEffect } from "react";

const allEmojis = ["🍒", "🍋", "🍊", "🍑", "🔔", "🍫", "7️⃣"];

const SpinningReel: React.FC = () => {
  const [currentEmoji, setCurrentEmoji] = useState("🍒");

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * allEmojis.length);
      setCurrentEmoji(allEmojis[randomIndex]);
    }, 100); // Change emoji every 100ms for a spinning effect

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-20 h-20 bg-gray-700 rounded-md flex items-center justify-center text-[3rem] md:text-[5.2rem] font-bold"
      aria-live="polite"
    >
      {currentEmoji}
    </div>
  );
};

export default SpinningReel;
