import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProposals, Proposal, getProposalStatus, getTotalVotes } from "../view-functions";
import { Card } from "./ui/card";

type ProposalFilter = 'all' | 'active' | 'inactive';

interface ProposalListProps {
    filter: ProposalFilter;
}

export const ProposalList: React.FC<ProposalListProps> = ({ filter }) => {
    const navigate = useNavigate();
    const [proposals, setProposals] = useState<(Proposal & { isActive: boolean; totalVotes: number })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProposals = async () => {
            setLoading(true);
            try {
                console.log("Starting to fetch proposals...");
                const data = await getProposals();
                console.log("Fetched Proposals:", data);
                if (data && data.length > 0) {
                    const proposalsWithStatus = await Promise.all(
                        data.map(async (proposal) => ({
                            ...proposal,
                            isActive: (await getProposalStatus(proposal.id)).isActive,
                            totalVotes: await getTotalVotes(proposal.id)
                        }))
                    );
                    setProposals(proposalsWithStatus);
                }
            } catch (error) {
                console.error("Error in fetchProposals:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProposals();
    }, []);

    if (loading) return <div>Loading proposals...</div>;
    if (!proposals.length) return <div>No proposals found</div>;

    const filteredProposals = proposals.filter(proposal => {
        if (filter === 'active') return proposal.isActive;
        if (filter === 'inactive') return !proposal.isActive;
        return true;
    });

    return (
        <div className="grid gap-4 p-4">
            {filteredProposals.map((proposal) => (
                <Card
                    key={proposal.id}
                    className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/proposal/${proposal.id}`)}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold mb-2">{proposal.title}</h2>
                            <p className="text-gray-600 line-clamp-2 mb-4">{proposal.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="flex gap-2">
                                <span className={`px-3 py-1 rounded-full text-sm ${proposal.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {proposal.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                                    {proposal.totalVotes} votes
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                        <div className="text-sm text-gray-500">
                            Created by: {proposal.creator.slice(0, 6)}...{proposal.creator.slice(-4)}
                        </div>
                        <div className="text-sm text-gray-500">
                            Deadline: {new Date(proposal.deadline * 1000).toLocaleString()}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};