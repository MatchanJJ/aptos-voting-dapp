import { aptos } from "../utils/aptosClient";
import { CONTRACT_ADDRESS } from "../utils/constants";
import { InputViewFunctionData } from "@aptos-labs/ts-sdk";

export const getProposalStatus = async (proposalId: number): Promise<{
    isActive: boolean;
    hasVoted: string | null;
}> => {
    try {
        const payload: InputViewFunctionData = {
            function: `${CONTRACT_ADDRESS}::Voting::is_active`,
            functionArguments: [CONTRACT_ADDRESS, proposalId]
        };

        const [isActive] = await aptos.view({ payload: payload });
        return {
            isActive: Boolean(isActive),
            hasVoted: null
        };
    } catch (error) {
        console.error(`Error checking proposal ${proposalId} status:`, error);
        return {
            isActive: false,
            hasVoted: null
        };
    }
};

export const hasVoted = async (proposalId: number, voterAddress: string): Promise<boolean> => {
    try {
        const payload: InputViewFunctionData = {
            function: `${CONTRACT_ADDRESS}::Voting::has_voted`,
            functionArguments: [CONTRACT_ADDRESS, proposalId, voterAddress]
        };

        const [hasVoted] = await aptos.view({ payload: payload });
        return Boolean(hasVoted);
    } catch (error) {
        console.error(`Error checking if address ${voterAddress} has voted on proposal ${proposalId}:`, error);
        return false;
    }
};
