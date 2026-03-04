import React from 'react';
import { useOSStore } from '../../store/useOSStore';
import { clsx } from 'clsx';

interface DesktopIconProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  onDoubleClick: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({ id, name, icon, onDoubleClick, draggable, onDragStart, onContextMenu }) => {
  const [isSelected, setIsSelected] = React.useState(false);

  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-start p-2 rounded w-24 cursor-pointer border border-transparent hover:bg-white/10 transition-colors",
        isSelected && "bg-white/20 border-white/30 backdrop-blur-sm"
      )}
      onClick={() => setIsSelected(!isSelected)}
      onDoubleClick={onDoubleClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onContextMenu={onContextMenu}
    >
      <div className="w-12 h-12 mb-1 flex items-center justify-center text-white drop-shadow-md">
        {icon}
      </div>
      <span className="text-xs text-white text-center font-medium drop-shadow-md line-clamp-2 leading-tight">
        {name}
      </span>
    </div>
  );
};
