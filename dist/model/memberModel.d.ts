interface Member {
    teamId: number;
    userId: number;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    joinedAt: Date;
}
export declare const MemberModel: {
    findByTeamAndUser(teamId: number, userId: number): Promise<Member | null>;
    addMember(data: Member): Promise<void>;
    clear(): Promise<void>;
};
export {};
//# sourceMappingURL=memberModel.d.ts.map