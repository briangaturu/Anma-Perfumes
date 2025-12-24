import React from "react";

const SeasonalMessage: React.FC = () => {
  const today = new Date();
  const month = today.getMonth() + 1; // 0-indexed
  const day = today.getDate();

  let message = "Welcome to Anma Perfumes, Cosmetics & Jewellery!";

  // Example seasonal messages
  if (month === 12 && day >= 1 && day <= 25) {
    message = "🎄 Merry Christmas! Discover our festive collections!";
  } else if (month === 12 && day > 25 && day <= 31) {
    message = "✨ Happy New Year! Start the year with luxury.";
  } else if (month === 2 && day >= 10 && day <= 14) {
    message = "❤️ Celebrate Valentine’s Day with our special perfumes!";
  } else if (month === 8 && day === 1) {
    message = "🎉 Happy Anniversary! Explore our exclusive offers!";
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 bg-[#1A1A1A] rounded-lg shadow-md text-center">
      <h2 className="text-xl md:text-2xl font-bold text-[#C9A24D]">{message}</h2>
    </section>
  );
};

export default SeasonalMessage;
