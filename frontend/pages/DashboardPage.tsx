import { useState } from "react";
import { ProposalList } from "../components/ProposalList";
import { Button } from "@/components/ui/button";

export const DashboardPage = () => {
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Voting Proposals</h1>
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'all' ? "default" : "outline"}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </Button>
                    <Button
                        variant={filter === 'active' ? "default" : "outline"}
                        onClick={() => setFilter('active')}
                        className="text-green-700 hover:text-green-800"
                    >
                        Active
                    </Button>
                    <Button
                        variant={filter === 'inactive' ? "default" : "outline"}
                        onClick={() => setFilter('inactive')}
                        className="text-gray-700 hover:text-gray-800"
                    >
                        Inactive
                    </Button>
                </div>
            </div>
            <ProposalList filter={filter} />
        </div>
    );
};
