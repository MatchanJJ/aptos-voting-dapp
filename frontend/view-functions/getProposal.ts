import { aptos } from "../utils/aptosClient";
import { CONTRACT_ADDRESS } from "../utils/constants";
import { InputViewFunctionData } from "@aptos-labs/ts-sdk";

export type Proposal = {
    id: number;
    creator: string;
    title: string;
    description: string;
    proposalType: string;
    options: Array<{ id: number; name: string }>;
    deadline: string;
    executed: boolean;
};

export const getProposals = async (): Promise<Proposal[]> => {
    try {
        const countPayload: InputViewFunctionData  = {
            function: `${CONTRACT_ADDRESS}::Voting::get_proposal_count`,
            functionArguments: [CONTRACT_ADDRESS]
        };

        const [count] = await aptos.view({ payload: countPayload });
        console.log("Total proposals count:", count);
        const proposals: Proposal[] = [];

        // Retrieve each proposal by its ID
        for (let i = 0; i < Number(count); i++) {
            const payload: InputViewFunctionData = {
                function: `${CONTRACT_ADDRESS}::Voting::get_proposal_info`,
                functionArguments: [CONTRACT_ADDRESS, i]
            };

            const proposalData = await aptos.view({payload: payload});
            console.log(`Raw proposal data for ID ${i}:`, proposalData);

            if (!proposalData || proposalData.length < 8) {
                console.warn(`Invalid proposal data for ID ${i}`);
                continue;
            }

            const [id, creator, title, description, proposalType, options, deadline, executed] = proposalData;
            
            proposals.push({
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
                deadline: new Date(Number(deadline) * 1000).toLocaleString(),
                executed: Boolean(executed),
            });
        }

        return proposals;
    } catch (error) {
        console.error("Error fetching proposals:", error);
        return [];
    }
};
