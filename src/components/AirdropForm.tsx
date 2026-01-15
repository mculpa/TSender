"use client"

import {InputForm}  from "./ui/InputField";
import { useState, useMemo } from "react";
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants";
import { useChainId, useReadContract, useConfig, useConnection, useWriteContract } from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { Account } from "viem/tempo";
import { calculateTotal } from "@/utils";

export default function AirdropForm() {
    const [tokenAddress, setTokenAddress] = useState("");
    const [recipients, setRecipients] = useState("");
    const [amounts, setAmounts] = useState("");
    const chainId = useChainId();
    const config = useConfig();
    const account = useConnection();
    const total: number = useMemo(() => calculateTotal(amounts), [amounts]); 
    const { data: hash, isPending, writeContractAsync} = useWriteContract();

    async function getApprovedAmount(tSenderAddress: string | null) : Promise<number> {
        if(!tSenderAddress) {
            alert("Unsupported chain");
            return 0;
        }
        console.log(account)
        // read from the chain to see if we have approved enough tokens
        const response = await readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "allowance",
            args: [account.address, tSenderAddress as `0x${string}`]
        })
        
        return response as number;


    }

    async function handleSubmit() {
        // If already approved, move to step 2
        // 1. Approve our tsender contract to send our tokens
        // 2. Call the airdrop function on the tsender contract
        // 3. wait for the tx to be mined
        console.log(total);
        const tSenderAddress = chainsToTSender[chainId]["tsender"]
        const approvedAmount = await getApprovedAmount(tSenderAddress)

        if(approvedAmount < total) {
            const approvalHash = await writeContractAsync({
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "approve",
                args: [tSenderAddress as `0x${string}`, BigInt(total)]
            })
            const approvalReceipt = await waitForTransactionReceipt(config, {
                hash: approvalHash
            })
            console.log("Approval confirmed: ", approvalReceipt);   
        }

        
    }

    return (
        <div>
            <InputForm
               label="Token Address"
               placeholder="0x"
               value={tokenAddress}
               onChange={e => setTokenAddress(e.target.value)}
               />
            <InputForm
               label="Recipients"
               placeholder="0x1111, 0x2222, 0x3333"
               value={recipients}
               onChange={e => setRecipients(e.target.value)}
               large={true}
               />
            <InputForm
               label="Amounts"
               placeholder="100, 200, 300"
               value={amounts}
               onChange={e => setAmounts(e.target.value)}
               large={true}
               />
            <button onClick={handleSubmit} className="block mx-auto px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200">
                Send Tokens
            </button>
        </div>

    )
}