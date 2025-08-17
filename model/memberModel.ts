

// File: model/MemberModel.ts
interface Member {
  teamId: number;
  userId: number;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: Date;
}

let members: Member[] = [];

export const MemberModel = {
  async findByTeamAndUser(teamId: number, userId: number) {
    return members.find(m => m.teamId === teamId && m.userId === userId) || null;
  },

  async addMember(data: Member) {
    members.push(data);
  },

  async clear() {
    members = [];
  }
};
