"use client";

interface FilterTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: { id: string; label: string; count?: number }[];
}

export default function FilterTabs({ activeTab, onTabChange, tabs }: FilterTabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-gray-900 border border-gray-800 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 text-sm rounded-md transition-all ${
            activeTab === tab.id
              ? "bg-gray-800 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800/50"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 text-xs text-gray-500">({tab.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}
