import React from 'react';
import { Home, FileText, Edit3, User } from 'lucide-react';
import { ActiveScreen } from '../types';

interface BottomNavProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate }) => {
  const tabs = [
    { id: 'home' as ActiveScreen, label: 'হোম', icon: Home },
    { id: 'report' as ActiveScreen, label: 'রিপোর্ট', icon: FileText },
    { id: 'notes' as ActiveScreen, label: 'নোটস', icon: Edit3 },
    { id: 'profile' as ActiveScreen, label: 'প্রোফাইল', icon: User },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 py-2 px-4 flex items-center justify-around shadow-lg z-30 no-print"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeScreen === tab.id;
        return (
          <button
            key={tab.id}
            id={`bottom-tab-${tab.id}`}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-blue-700 font-bold scale-105' : 'text-slate-500 hover:text-slate-700 font-medium'
            }`}
          >
            <div
              className={`p-1 rounded-full ${
                isActive ? 'bg-blue-100/90 text-blue-700' : 'text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5 whitespace-nowrap">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
