"use client";

import React, { createContext, useState, useContext } from 'react';
import type { Team } from '@/types/user';

interface TeamContextType {
  selectedTeam: Team | null;
  selectTeam: (team: Team | null) => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const selectTeam = (team: Team | null) => {
    setSelectedTeam(team);
  };

  return (
    <TeamContext.Provider value={{ selectedTeam, selectTeam }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};