import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { CONTRACT_ADDRESS, MODULE_URL } from "../utils/constants";

export type ProposalArguments = {
    title: string;
    description: string;
    proposal_type: bigint;
    options: string[];
    deadline: bigint;
};

export const createProposal = (args: ProposalArguments): InputTransactionData => {
    const { title, description, proposal_type, options, deadline } = args;

    if (typeof proposal_type !== 'bigint') {
        throw new Error('proposal_type must be a BigInt');
    }
    if (typeof deadline !== 'bigint') {
        throw new Error('deadline must be a BigInt');
    }
    if (!Array.isArray(options)) {
        throw new Error('options must be an array of strings');
    }
    if (options.some(opt => typeof opt !== 'string')) {
        throw new Error('all options must be strings');
    }

    return {
        data: {
            function: `${MODULE_URL}::create_proposal`,
            functionArguments: [
                CONTRACT_ADDRESS,      
                title,                
                description,          
                proposal_type,        
                options,              
                deadline,            
            ],
        },
    };
}