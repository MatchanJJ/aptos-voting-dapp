import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import {CONTRACT_ADDRESS, MODULE_URL} from "../utils/constants";
export type VotingArguments = {
    voter: string;
    proposal_id: number;
    option_id: number;
};

export const vote = (args: VotingArguments): InputTransactionData => {
    const {voter, proposal_id, option_id} = args;
    
    return{
        data: {
            function: `${MODULE_URL}::vote`,
            functionArguments: [voter,CONTRACT_ADDRESS,proposal_id, option_id],
        }
    }
}