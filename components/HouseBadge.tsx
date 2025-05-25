
import React from 'react';
import { HogwartsHouse } from '../types';
import { HOUSE_THEMES, HouseTheme } from '../constants';

interface HouseBadgeProps {
  house: HogwartsHouse;
  showDescription?: boolean;
}

const HouseBadge: React.FC<HouseBadgeProps> = ({ house, showDescription = false }) => {
  const theme: HouseTheme | undefined = HOUSE_THEMES[house];

  if (!theme) {
    return <div className="text-red-500">Invalid House</div>;
  }

  return (
    <div className={`p-6 rounded-lg shadow-xl border-4 ${theme.borderColor} ${theme.color} flex flex-col items-center text-center`}>
      <div className="text-6xl mb-3">{theme.crest || '◆'}</div>
      <h3 className={`text-4xl font-bold ${theme.textColor}`}>{theme.name}</h3>
      {showDescription && <p className={`mt-2 text-md ${theme.textColor} opacity-90 font-body`}>{theme.description}</p>}
    </div>
  );
};

export default HouseBadge;
