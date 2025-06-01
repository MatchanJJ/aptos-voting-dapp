import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { createProposal } from "../entry-functions/createProposal";
import { toast } from "./ui/use-toast";

export const CreateProposal = () => {
    const { signAndSubmitTransaction, account } = useWallet();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [proposalType, setProposalType] = useState<number>(0);
    const [options, setOptions] = useState<string[]>([""]);
    const [deadline, setDeadline] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addOption = () => {
        setOptions([...options, ""]);
    };

    const removeOption = (index: number) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting || !account) return;

        try {
            setIsSubmitting(true);

            const deadlineDate = new Date(deadline);
            const deadlineTimestamp = Math.floor(deadlineDate.getTime() / 1000);
            if (isNaN(deadlineTimestamp)) {
                throw new Error("Invalid deadline value");
            }

    
            const numericProposalType = Number(proposalType);
            if (isNaN(numericProposalType)) {
                throw new Error('Invalid proposal type value');
            }

            const proposalTypeBigInt = BigInt(numericProposalType);
            const deadlineBigInt = BigInt(deadlineTimestamp);

            // Filter and validate options array
            const filteredOptions = options
                .filter(opt => opt.trim() !== "")
                .map(opt => opt.trim()); // ensure clean strings

            if (filteredOptions.length === 0) {
                throw new Error("At least one option is required");
            }


            const payload = createProposal({
                title: title,
                description: description,
                proposal_type: proposalTypeBigInt,
                options: filteredOptions,
                deadline: deadlineBigInt
            });
            console.log('Final payload:', payload);
            const response = await signAndSubmitTransaction(payload);
            console.log("Transaction submitted:", response);

            toast({
                title: "Success",
                description: "Proposal created successfully!",
            });

           
            setTitle("");
            setDescription("");
            setProposalType(0);
            setOptions([""]);
            setDeadline("");

        } catch (error) {
            console.error("Error creating proposal:", error);
            toast({
                title: "Error",
                description: "Failed to create proposal. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="p-6 max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="proposalType">Proposal Type</Label>
                    <select
                        id="proposalType"
                        value={proposalType}
                        onChange={(e) => {
                            const newValue = parseInt(e.target.value, 10);
                            if (!isNaN(newValue)) {
                                console.log('Selected proposal type:', newValue);
                                setProposalType(newValue);
                            }
                        }}
                        className="w-full p-2 border rounded"
                    >
                        <option value="0">General</option>
                        <option value="1">Election</option>
                    </select>
                </div>

                <div>
                    <Label>Options</Label>
                    {options.map((option, index) => (
                        <div key={index} className="flex gap-2 mt-2">
                            <Input
                                value={option}
                                onChange={(e) => updateOption(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                required
                            />
                            {options.length > 1 && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => removeOption(index)}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={addOption}
                        className="mt-2"
                    >
                        Add Option
                    </Button>
                </div>

                <div>
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                        id="deadline"
                        type="datetime-local"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        required
                    />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Proposal"}
                </Button>
            </form>
        </Card>
    );
};