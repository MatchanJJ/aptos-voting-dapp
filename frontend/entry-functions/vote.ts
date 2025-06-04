import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import {CONTRACT_ADDRESS, MODULE_URL} from "../utils/constants";
export type VotingArguments = {
    proposal_id: number;
    option_id: number;
};

export const vote = (args: VotingArguments): InputTransactionData => {
    const {proposal_id, option_id} = args;
    
    return{
        data: {
            function: `${MODULE_URL}::vote`,
            functionArguments: [CONTRACT_ADDRESS,proposal_id, option_id],
        }
    }
}