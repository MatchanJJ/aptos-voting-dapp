import React, { useEffect, useState } from 'react';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Proposal } from '../types/proposal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProposalById } from '../view-functions/getProposalInfo';
import { getProposalCount } from '../view-functions/getProposalCount';
import { getWinningOption } from '../view-functions/getProposalWinner';
import { WinningOption } from '../view-functions/getProposalWinner';
import { getProposalStatus } from '../view-functions/getProposalStatus';
import { TIE_RESULT_ID } from '../utils/constants';

const DashboardPage = () => {
    const { account } = useWallet();
    const [executedProposals, setExecutedProposals] = useState<Array<{
        proposal: Proposal;
        winner: WinningOption | null;
    }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExecutedProposals = async () => {
            if (!account?.address) return;

            try {
                console.log("Fetching proposal count...");
                const count = await getProposalCount();
                console.log("Total proposals:", count);
                const proposals = [];

                for (let i = 0; i < count; i++) {
                    console.log(`Checking proposal ${i} status...`);
                    const status = await getProposalStatus(i);
                    
                    if (!status.isActive) {
                        console.log(`Proposal ${i} is inactive, fetching details...`);
                        const proposal = await getProposalById(i);
                        if (proposal) {
                            let winner = null;
                            try {
                                winner = await getWinningOption(i);
                                console.log(`Winner for proposal ${i}:`, winner);
                            } catch (err) {
                                console.error(`Error fetching winner for proposal ${i}:`, err);
                            }
                            proposals.push({ proposal, winner });
                        }
                    }
                }

                console.log("Final inactive proposals list:", proposals);
                setExecutedProposals(proposals);
            } catch (error) {
                console.error("Error fetching executed proposals:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExecutedProposals();
    }, [account?.address]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!account?.address) {
        return (
            <div className="flex justify-center items-center h-screen">
                Please connect your wallet to view executed proposals
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Concluded Proposals</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {executedProposals.map(({ proposal, winner }) => (
                    <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-lg">{proposal.title}</CardTitle>
                            <div className="text-sm text-gray-500">
                                Type: {proposal.proposalType}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm mb-4">{proposal.description}</p>
                            <div className="border-t pt-4">
                                <div className="text-sm font-semibold text-emerald-600">
                                    Result: {winner ? (
                                        winner.id === TIE_RESULT_ID ? (
                                            winner.name === "No Votes" ?
                                                "No votes cast" :
                                                `Tie (${winner.votes} votes each)`
                                        ) :
                                            `Winner: ${winner.name} (${winner.votes} votes)`
                                    ) : 'Error fetching results'}
                                </div>
                                {winner && (
                                    <div className="text-sm text-gray-500">
                                        Votes received: {winner.votes}
                                    </div>
                                )}
                                <div className="text-xs text-gray-400 mt-2">
                                    Ended: {new Date(proposal.deadline * 1000).toLocaleDateString()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {executedProposals.length === 0 && (
                    <div className="col-span-full text-center text-gray-500">
                        No concluded proposals found
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;

