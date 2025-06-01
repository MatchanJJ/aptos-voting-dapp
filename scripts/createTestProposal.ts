/**
 * This script creates a test proposal using the Aptos SDK.
 */

import "dotenv/config";
import {
    Account,
    Aptos,
    AptosConfig,
    Network,
    Ed25519PrivateKey,
} from "@aptos-labs/ts-sdk";
import { CONTRACT_ADDRESS, MODULE_URL } from "../frontend/utils/constants";

async function main() {
    console.log("This script will create a test proposal using a newly generated account");

    try {
        // 0. Setup client
        const config = new AptosConfig({ network: Network.TESTNET });
        const aptos = new Aptos(config);

        // Use your account - replace with your account's private key
        const privateKeyHex = process.env.VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY;
        if (!privateKeyHex) {
            throw new Error("Please set APTOS_PRIVATE_KEY environment variable with your account's private key");
        }

        // Create private key from hex
        const cleanPrivateKey = privateKeyHex.replace('0x', '');
        if (!/^[0-9a-fA-F]{64}$/.test(cleanPrivateKey)) {
            throw new Error("Invalid private key format. Must be a 32-byte hex string");
        }

        // Convert hex string to Uint8Array
        const keyBytes = new Uint8Array(cleanPrivateKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
        const privateKey = new Ed25519PrivateKey(keyBytes);

        const account = Account.fromPrivateKey({ privateKey });
        console.log("\n=== Account Details ===\n");
        console.log(`Using account address: ${account.accountAddress}`);

        // Prepare proposal data
        const title = "Test Proposal";
        const description = "This is a test proposal";
        const options = ["Option A", "Option B"];
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 86400); // 24 hours from now

        // 1. Build transaction
        console.log("\n=== 1. Building the transaction ===\n");
        const transaction = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: {
                function: `${MODULE_URL}::create_proposal`,
                typeArguments: [],
                functionArguments: [
                    CONTRACT_ADDRESS,      // contract_addr
                    title,                // title
                    description,          // description
                    0n,                   // proposal_type (General)
                    options,              // voting options
                    deadline,             // deadline
                ]
            },
        });
        console.log("Built the transaction!");

        // 2. Simulate (Optional)
        console.log("\n=== 2. Simulating transaction ===\n");
        const [simulateResponse] = await aptos.transaction.simulate.simple({
            signerPublicKey: account.publicKey,
            transaction,
        });
        console.log("Simulation response:", simulateResponse);

        // 3. Sign
        console.log("\n=== 3. Signing transaction ===\n");
        const senderAuthenticator = aptos.transaction.sign({
            signer: account,
            transaction,
        });
        console.log("Signed the transaction!");

        // 4. Submit
        console.log("\n=== 4. Submitting transaction ===\n");
        const submittedTransaction = await aptos.transaction.submit.simple({
            transaction,
            senderAuthenticator,
        });
        console.log(`Submitted transaction hash: ${submittedTransaction.hash}`);

        // 5. Wait for results
        console.log("\n=== 5. Waiting for transaction result ===\n");
        const executedTransaction = await aptos.waitForTransaction({
            transactionHash: submittedTransaction.hash
        });
        console.log("Transaction result:", executedTransaction);

    } catch (error: any) {
        console.error("\n=== Error ===\n");
        console.error("Error creating proposal:", error);
        console.error("Error details:", {
            name: error.name,
            message: error.message,
            vmStatus: error.vmStatus,
            data: error.data
        });
    }
}


main();
