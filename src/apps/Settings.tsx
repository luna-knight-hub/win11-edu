import React from 'react';
import { useOSStore } from '../store/useOSStore';
import { clsx } from 'clsx';

export const Settings: React.FC<{ windowId: string }> = () => {
  const { setWallpaper, wallpaper } = useOSStore();

  const wallpapers = [
    'https://picsum.photos/seed/windows11/1920/1080',
    'https://picsum.photos/seed/nature/1920/1080',
    'https://picsum.photos/seed/tech/1920/1080',
    'https://picsum.photos/seed/abstract/1920/1080',
  ];

  return (
    <div className="flex flex-col h-full bg-[#f3f3f3] p-6">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <h2 className="text-lg font-medium mb-4">Personalization</h2>
        <div className="grid grid-cols-2 gap-4">
          {wallpapers.map((url, index) => (
            <div 
              key={index}
              onClick={() => setWallpaper(url)}
              className={clsx(
                "cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                wallpaper === url ? "border-blue-500" : "border-transparent"
              )}
            >
              <img src={url} alt={`Wallpaper ${index + 1}`} className="w-full h-32 object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-medium mb-2">System Info</h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p>OS Version: Windows 11 EduSim 1.0</p>
          <p>Processor: Virtual CPU</p>
          <p>RAM: 8 GB (Simulated)</p>
        </div>
      </div>
    </div>
  );
};
