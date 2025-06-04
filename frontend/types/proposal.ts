export interface ProposalOption {
    id: number;
    name: string;
}

export interface Proposal {
    id: number;
    creator: string;
    title: string;
    description: string;
    proposalType: string;
    options: ProposalOption[];
    deadline: number;
    isActive?: boolean;
}
