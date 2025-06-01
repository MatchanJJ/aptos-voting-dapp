import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { CONTRACT_ADDRESS, MODULE_URL } from "../utils/constants";

export type ExecuteProposalArguments = {
    proposal_id: bigint;
};

export const executeProposal = (args: ExecuteProposalArguments): InputTransactionData => {
    const { proposal_id } = args;

    if (typeof proposal_id !== 'bigint') {
        throw new Error('proposal_id must be a BigInt');
    }

    return {
        data: {
            function: `${MODULE_URL}::execute_proposal`,
            functionArguments: [
                CONTRACT_ADDRESS,      
                proposal_id,          
            ],
        },
    };
};
