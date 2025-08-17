import { prisma } from '../lib/prisma.js';
import type { Prisma } from '@prisma/client';
// File: model/TeamModel.ts
interface Team {
  id: number;
  teamName: string;
  ownerId: number;
  currency: string;
  budget: number;
  incomeGoal: number;
  allowMemberViewReport: boolean;
  categories: any;
  createdAt: Date;
  updatedAt: Date;
}

let teams: Team[] = [];
let teamIdCounter = 1;

export const TeamModel = {
  async findById(id: number) {
    return teams.find(t => t.id === id) || null;
  },

  async create(data: Omit<Team, 'id'>) {
    const team = { id: teamIdCounter++, ...data };
    teams.push(team);
    return team;
  },

  async clear() {
    teams = [];
  }
};
