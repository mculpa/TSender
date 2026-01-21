"use client"

import {InputForm}  from "./ui/InputField";
import { useState, useMemo, useEffect } from "react";
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants";
import { useChainId, useReadContract, useConfig, useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { CgSpinner } from "react-icons/cg"
import { Account } from "viem/tempo";
import { calculateTotal } from "@/utils";
import { token } from "viem/tempo/actions";

export default function AirdropForm() {
    const [tokenAddress, setTokenAddress] = useState("");
    const [recipients, setRecipients] = useState("");
    const [amounts, setAmounts] = useState("");
    const chainId = useChainId();
    const config = useConfig();
    const account = useAccount();
    const total: number = useMemo(() => calculateTotal(amounts), [amounts]);

    const { data: hash, isPending, error, writeContractAsync } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed, isError } = useWaitForTransactionReceipt({
        confirmations: 1,
        hash,
    })

        const { data: tokenInfo } = useReadContracts({
        contracts: [
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "decimals",
            },
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "name",
            },
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "balanceOf",
                args: [account.address],
            },
        ],
    })
    const [hasEnoughTokens, setHasEnoughTokens] = useState(true)
    

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
        if (!account) {
            alert("Please connect your wallet first");
            return;
        }

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
            const transactionHash = await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    // Comma or new line separated
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ],
            })
              
        } else {
            const transactionHash =await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    // Comma or new line separated
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ],
            })
        }

        
    }

        function getButtonContent() {
        if (isPending)
            return (
                <div className="flex items-center justify-center gap-2 w-full">
                    <CgSpinner className="animate-spin" size={20} />
                    <span>Confirming in wallet...</span>
                </div>
            )
        if (isConfirming)
            return (
                <div className="flex items-center justify-center gap-2 w-full">
                    <CgSpinner className="animate-spin" size={20} />
                    <span>Waiting for transaction to be included...</span>
                </div>
            )
        if (error || isError) {
            console.log(error)
            return (
                <div className="flex items-center justify-center gap-2 w-full">
                    <span>Error, see console.</span>
                </div>
            )
        }
        if (isConfirmed) {
            return "Transaction confirmed."
        }
        return "Send Tokens"
    }

        function formatTokenAmount(weiAmount: number, decimals: number): string {
    const tokenAmount = weiAmount / Math.pow(10, decimals)
    return tokenAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

        useEffect(() => {
        const savedTokenAddress = localStorage.getItem('tokenAddress')
        const savedRecipients = localStorage.getItem('recipients')
        const savedAmounts = localStorage.getItem('amounts')

        if (savedTokenAddress) setTokenAddress(savedTokenAddress)
        if (savedRecipients) setRecipients(savedRecipients)
        if (savedAmounts) setAmounts(savedAmounts)
    }, [])

    useEffect(() => {
        localStorage.setItem('tokenAddress', tokenAddress)
    }, [tokenAddress])

    useEffect(() => {
        localStorage.setItem('recipients', recipients)
    }, [recipients])

    useEffect(() => {
        localStorage.setItem('amounts', amounts)
    }, [amounts])

    useEffect(() => {
        if (tokenAddress && total > 0 && tokenInfo?.[2]?.result as number !== undefined) {
            const userBalance = tokenInfo?.[2].result as number;
            setHasEnoughTokens(userBalance >= total);
        } else {
            setHasEnoughTokens(true);
        }
    }, [tokenAddress, total, tokenInfo]);

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
               <div className="bg-white border border-zinc-300 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-zinc-900 mb-3">Transaction Details</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-600">Token Name:</span>
                            <span className="font-mono text-zinc-900">
                                {tokenInfo?.[1]?.result as string}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-600">Amount (wei):</span>
                            <span className="font-mono text-zinc-900">{total}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-600">Amount (tokens):</span>
                            <span className="font-mono text-zinc-900">
                                {formatTokenAmount(total, tokenInfo?.[0]?.result as number)}
                            </span>
                        </div>
                    </div>
                </div>
            <button onClick={handleSubmit} className={"block mx-auto px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"} 
             disabled={isPending || (!hasEnoughTokens && tokenAddress !== "")}
            >
            {isPending || error || isConfirming
                        ? getButtonContent()
                        : !hasEnoughTokens && tokenAddress
                            ? "Insufficient token balance"
                            : "Send Tokens"}
                        
            </button>
        </div>

    )
}