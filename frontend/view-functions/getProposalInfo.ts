import { aptos } from "../utils/aptosClient";
import { CONTRACT_ADDRESS } from "../utils/constants";
import { InputViewFunctionData } from "@aptos-labs/ts-sdk";
import { Proposal } from "../types/proposal";

export const getProposals = async (): Promise<Proposal[]> => {
    try {
        const countPayload: InputViewFunctionData = {
            function: `${CONTRACT_ADDRESS}::Voting::get_proposal_count`,
            functionArguments: [CONTRACT_ADDRESS]
        };

        const [count] = await aptos.view({ payload: countPayload });
        console.log("Total proposals count:", count);
        const proposals: Proposal[] = [];

        // Retrieving proposal by id++
        for (let i = 0; i < Number(count); i++) {
            const proposal = await getProposalById(i);
            if (proposal) {
                proposals.push(proposal);
            }
        }

        return proposals;
    } catch (error) {
        console.error("Error fetching proposals:", error);
        return [];
    }
};

export const getProposalById = async (proposalId: number): Promise<Proposal | null> => {
    try {
        const payload: InputViewFunctionData = {
            function: `${CONTRACT_ADDRESS}::Voting::get_proposal_info`,
            functionArguments: [CONTRACT_ADDRESS, proposalId]
        };

        const proposalData = await aptos.view({ payload: payload });
        console.log(`Raw proposal data for ID ${proposalId}:`, proposalData);

        if (!proposalData || proposalData.length < 8) {
            console.warn(`Invalid proposal data for ID ${proposalId}`);
            return null;
        }

        const [id, creator, title, description, proposalType, options, deadline, executed] = proposalData;

        return {
            id: Number(id),
            creator: typeof creator === "string" ? creator : new TextDecoder().decode(new Uint8Array(creator as any)),
            title: typeof title === "string" ? title : new TextDecoder().decode(new Uint8Array(title as any)),
            description: typeof description === "string" ? description : new TextDecoder().decode(new Uint8Array(description as any)),
            proposalType: Number(proposalType) === 0 ? "General" : "Election",
            options: Array.isArray(options)
                ? options.map((opt: any) => ({
                    id: Number(opt.id),
                    name: typeof opt.name === "string" ? opt.name : new TextDecoder().decode(new Uint8Array(opt.name))
                }))
                : [],
            deadline: Number(deadline),
            executed: Boolean(executed),
        };
    } catch (error) {
        console.error(`Error fetching proposal ${proposalId}:`, error);
        return null;
    }
};
