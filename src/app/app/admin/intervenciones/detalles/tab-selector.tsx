import { useState } from "react";

export default function TabSelector({
  Titles,
  onTabChange,
}: {
  Titles: string[];
  onTabChange: (tab: string) => void;
}) {
  const [activeTab, setActiveTab] = useState(Titles[0]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  const selectedClasses =
    "bg-white text-green-900 font-semibold shadow-lg ease-in-out";
  const unselectedClasses =
    "text-green-800/70 hover:text-green-900 transition-colors";
  const baseClasses =
    "rounded-md text-lg cursor-pointer text-center whitespace-nowrap py-2 px-2";

  return (
    <div className="mb-6">
      <div className="py-1 h-14 w-fit bg-[#DEEBD9] overflow-hidden rounded-md items-center flex gap-3 px-2">
        {Titles.map((title, index) => (
          <button
            key={index}
            onClick={() => {
              handleTabClick(title);
            }}
            className={`${baseClasses} ${
              activeTab === title ? selectedClasses : unselectedClasses
            }`}
          >
            {title}
          </button>
        ))}
      </div>
    </div>
  );
}
