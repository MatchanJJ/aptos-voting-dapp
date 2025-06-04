import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AptosClient } from "aptos";
import { getProposalById, hasVoted, getProposalStatus, getVoteCount, getTotalVotes, getWinningOption, type WinningOption } from '../view-functions';
import { vote } from '../entry-functions/vote';
import { Proposal } from '../types/proposal';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from './ui/use-toast';

const ProposalDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { account, signAndSubmitTransaction } = useWallet();
    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasUserVoted, setHasUserVoted] = useState(false);
    const [votingInProgress, setVotingInProgress] = useState(false);
    const [voteCounts, setVoteCounts] = useState<Record<number, number>>({});
    const [totalVotes, setTotalVotes] = useState<number>(0);
    const [winningOption, setWinningOption] = useState<WinningOption | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchProposalAndVoteStatus = async () => {
            if (!id || !account?.address) {
                setError('No proposal ID or wallet not connected');
                setLoading(false);
                return;
            }

            try {
                const [proposalData, status] = await Promise.all([
                    getProposalById(Number(id)),
                    getProposalStatus(Number(id))
                ]);

                if (!proposalData) {
                    setError('Proposal not found');
                    return;
                }

                setProposal({ ...proposalData, isActive: status.isActive });

                const votesPromises = proposalData.options.map(option =>
                    getVoteCount(Number(id), option.id)
                );
                const votes = await Promise.all(votesPromises);
                const voteCountsMap = proposalData.options.reduce((acc, option, index) => {
                    acc[option.id] = votes[index];
                    return acc;
                }, {} as Record<number, number>);
                setVoteCounts(voteCountsMap);

                const total = await getTotalVotes(Number(id));
                setTotalVotes(total);

                if (!status.isActive) {
                    const winner = await getWinningOption(Number(id));
                    setWinningOption(winner);
                }

                const voted = await hasVoted(Number(id), account.address.toString());
                setHasUserVoted(voted);

                if (status.isActive && proposalData.deadline) {
                    const now = Date.now() / 1000; // Convert to seconds
                    const timeUntilDeadline = proposalData.deadline - now;

                    if (timeUntilDeadline > 0) {
                        const timeoutId = setTimeout(async () => {
                            const newStatus = await getProposalStatus(Number(id));
                            if (!newStatus.isActive) {
                                const winner = await getWinningOption(Number(id));
                                setWinningOption(winner);
                                setProposal(prev => prev ? { ...prev, isActive: false } : null);
                            }
                        }, timeUntilDeadline * 1000); 

                        return () => clearTimeout(timeoutId);
                    }
                }
            } catch (err) {
                setError('Error fetching proposal details');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProposalAndVoteStatus();
    }, [id, account?.address]);

    const handleVote = async (optionId: number) => {
        if (!account?.address || !id || !proposal || hasUserVoted || votingInProgress) return;

        setVotingInProgress(true);
        try {
            const payload = vote({
                proposal_id: Number(id),
                option_id: optionId,
            });

            const response = await signAndSubmitTransaction(payload);

            const client = new AptosClient('https://fullnode.testnet.aptoslabs.com');
            await client.waitForTransaction(response.hash);

            setHasUserVoted(true);
            toast({
                title: "Vote submitted successfully!",
                description: "Your vote has been recorded on the blockchain.",
            });
        } catch (err) {
            console.error('Error voting:', err);
            toast({
                title: "Error submitting vote",
                description: "There was an error submitting your vote. Please try again.",
                variant: "destructive",
            });
        } finally {
            setVotingInProgress(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error || !proposal) {
        return (
            <div className="flex justify-center items-center h-screen text-red-500">
                {error || 'Proposal not found'}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="w-full max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>{proposal?.title}</CardTitle>
                    <div className="text-sm text-gray-500">
                        Created by: {proposal?.creator}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold">Description</h3>
                            <p className="mt-1">{proposal?.description}</p>
                        </div>

                        <div>
                            <h3 className="font-semibold">Type</h3>
                            <p className="mt-1">{proposal?.proposalType}</p>
                        </div>

                        <div>
                            <h3 className="font-semibold">Options</h3>
                            {hasUserVoted && (
                                <div className="mb-2 text-sm text-amber-600">
                                    You have already voted on this proposal
                                </div>
                            )}
                            <div className="mt-2 space-y-2">
                                {proposal?.options.map((option) => (
                                    <Button
                                        key={option.id}
                                        variant={hasUserVoted ? "outline" : "default"}
                                        className="w-full text-left justify-between"
                                        disabled={hasUserVoted || !proposal.isActive || votingInProgress}
                                        onClick={() => handleVote(option.id)}
                                    >
                                        <span>{option.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">
                                                {voteCounts[option.id] || 0} votes
                                            </span>
                                            {totalVotes > 0 && (
                                                <span className="text-sm text-gray-500">
                                                    ({Math.round((voteCounts[option.id] || 0) / totalVotes * 100)}%)
                                                </span>
                                            )}
                                            {votingInProgress && (
                                                <span className="ml-2">Voting...</span>
                                            )}
                                        </div>
                                    </Button>
                                ))}
                            </div>                            <div className="mt-2 text-sm text-right">
                                {!proposal.isActive && (
                                    <div className="text-blue-600 font-semibold mb-2">
                                        Winning Option: {winningOption?.name} ({winningOption?.votes} votes)
                                    </div>
                                )}
                                <div className="text-gray-500">
                                    Total votes: {totalVotes}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <p className="text-sm text-gray-500">
                                Deadline: {new Date(proposal?.deadline! * 1000).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">
                                Status: {proposal?.isActive ? 'Active' : 'Inactive'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProposalDetail;
