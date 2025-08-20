let members = [];
export const MemberModel = {
    async findByTeamAndUser(teamId, userId) {
        return members.find(m => m.teamId === teamId && m.userId === userId) || null;
    },
    async addMember(data) {
        members.push(data);
    },
    async clear() {
        members = [];
    }
};
//# sourceMappingURL=memberModel.js.map