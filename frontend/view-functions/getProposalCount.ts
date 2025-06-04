import { aptos } from "../utils/aptosClient";
import { CONTRACT_ADDRESS } from "../utils/constants";
import { InputViewFunctionData } from "@aptos-labs/ts-sdk";

export const getProposalCount = async (): Promise<number> => {
    try {
        const payload: InputViewFunctionData = {
            function: `${CONTRACT_ADDRESS}::Voting::get_proposal_count`,
            functionArguments: [CONTRACT_ADDRESS]
        };

        const [count] = await aptos.view({ payload: payload });
        return Number(count);
    } catch (error) {
        console.error("Error fetching proposal count:", error);
        return 0;
    }
};
