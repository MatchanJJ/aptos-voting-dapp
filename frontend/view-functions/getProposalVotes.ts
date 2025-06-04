import { aptos } from "../utils/aptosClient";
import { CONTRACT_ADDRESS } from "../utils/constants";
import { InputViewFunctionData } from "@aptos-labs/ts-sdk";

export const getVoteCount = async (proposalId: number, optionId: number): Promise<number> => {
    try {
        const payload: InputViewFunctionData = {
            function: `${CONTRACT_ADDRESS}::Voting::get_vote_count_per_candidate`,
            functionArguments: [CONTRACT_ADDRESS, proposalId, optionId]
        };

        const [count] = await aptos.view({ payload: payload });
        return Number(count);
    } catch (error) {
        console.error(`Error fetching vote count for proposal ${proposalId}, option ${optionId}:`, error);
        return 0;
    }
};

export const getTotalVotes = async (proposalId: number): Promise<number> => {
    try {
        const payload: InputViewFunctionData = {
            function: `${CONTRACT_ADDRESS}::Voting::get_proposal_total_votes`,
            functionArguments: [CONTRACT_ADDRESS, proposalId]
        };

        const [total] = await aptos.view({ payload: payload });
        return Number(total);
    } catch (error) {
        console.error(`Error fetching total votes for proposal ${proposalId}:`, error);
        return 0;
    }
};
