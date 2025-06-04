import { aptos } from "../utils/aptosClient";
import { CONTRACT_ADDRESS } from "../utils/constants";
import { InputViewFunctionData } from "@aptos-labs/ts-sdk";

export type WinningOption = {
    id: number;
    name: string;
    votes: number;
};

export const getWinningOption = async (proposalId: number): Promise<WinningOption | null> => {
    try {
        const payload: InputViewFunctionData = {
            function: `${CONTRACT_ADDRESS}::Voting::get_winning_option`,
            functionArguments: [CONTRACT_ADDRESS, proposalId]
        };

        const [id, name, votes] = await aptos.view({ payload: payload });

        return {
            id: Number(id),
            name: typeof name === "string" ? name : new TextDecoder().decode(new Uint8Array(name as any)),
            votes: Number(votes)
        };
    } catch (error) {
        console.error(`Error fetching winning option for proposal ${proposalId}:`, error);
        return null;
    }
};
