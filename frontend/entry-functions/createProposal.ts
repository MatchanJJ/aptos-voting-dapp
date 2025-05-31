import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export type ProposalArguments = {
    creator: string;
    title: Uint8Array[];
    description: Uint8Array[];
    proposal_type: number;
    options: Uint8Array[][];
    deadline: number
};

export const createProposal = (args: ProposalArguments): InputTransactionData => {
    const {creator, title, description, proposal_type, options, deadline} = args;
    return{
        data:{
            function: "0x935651075d8914c382156af1b06116a4b50b5340aeb0fe2226c6eb7d2c067200::Voting::create_proposal",
            functionArguments: [creator,title,description,proposal_type,options,deadline],
        },
    };
}