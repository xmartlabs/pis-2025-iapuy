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

  const selectedClasses = "bg-white text-[#121F0D] ease-in-out";
  const unselectedClasses =
    "text-[#5B9B40] hover:text-green-900 transition-colors";
  const baseClasses =
    "rounded-md font-medium text-sm leading-5 cursor-pointer text-center whitespace-nowrap py-1.5 px-1";

  return (
    <div className="my-5">
      <div className="h-10 w-fit bg-[#DEEBD9] overflow-hidden rounded-md items-center flex gap-3 px-1">
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
