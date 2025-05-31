import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export type VotingArguments = {
    voter: string;
    contract_addr: string;
    proposal_id: number;
    option_id: number;
};

export const vote = (args: VotingArguments): InputTransactionData => {
    const {voter, contract_addr, proposal_id, option_id} = args;
    return{
        data: {
            function: "0x935651075d8914c382156af1b06116a4b50b5340aeb0fe2226c6eb7d2c067200::Voting::vote",
            functionArguments: [voter,contract_addr,proposal_id, option_id],
        }
    }
}