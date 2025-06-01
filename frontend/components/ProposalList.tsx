import { useEffect, useState } from "react";
import { getProposals, Proposal } from "../view-functions/getProposal";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export const ProposalList = () => {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProposals = async () => {
            try {
                const data = await getProposals();
                console.log("Fetched Proposals:", data);
                if (data && data.length > 0) {
                    setProposals(data);
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

    return (
        <div className="grid gap-4 p-4">
            {proposals.map((proposal) => (
                <Card key={proposal.id} className="p-4">
                    <h2 className="text-xl font-bold mb-2">Title: {proposal.title}</h2>
                    <p className="text-gray-600 mb-4">Description: {proposal.description}</p>
                    <div className="grid gap-2">
                        <p>Type: {proposal.proposalType}</p>
                        <p>Created by: {proposal.creator}</p>
                        <p>Deadline: {proposal.deadline}</p>
                        <p>Status: {proposal.executed ? 'Executed' : 'Active'}</p>
                        <div className="mt-4">
                            <h3 className="font-semibold mb-2">Options:</h3>
                            <div className="flex flex-wrap gap-2">
                                {proposal.options.map((option) => (
                                    <Button
                                        key={option.id}
                                        variant="outline"
                                        className="px-4 py-2"
                                        disabled={proposal.executed}
                                    >
                                        {option.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};