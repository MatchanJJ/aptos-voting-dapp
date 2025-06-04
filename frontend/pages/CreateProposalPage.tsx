import { CreateProposal } from "../components/CreateProposal";

export const CreateProposalPage = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Create New Proposal</h1>
            <CreateProposal />
        </div>
    );
};
