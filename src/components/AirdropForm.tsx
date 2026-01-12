"use client"

import InputField from "./ui/InputField";
import { useState } from "react";

export default function AirdropForm() {
    const [tokenAddress, setTokenAddress] = useState("");
    const [recipients, setRecipients] = useState("");
    const [amounts, setAmounts] = useState("");

    async function handleSubmit() {
        console.log("Hi from submit button")
    }

    return (
        <div>
            <InputField
               label="Token Address"
               placeholder="0x"
               value={tokenAddress}
               onChange={setTokenAddress} 
               />
            <InputField
               label="Recipients"
               placeholder="0x1111, 0x2222, 0x3333"
               value={recipients}
               onChange={setRecipients}
               large={true}
               />
            <InputField
               label="Amounts"
               placeholder="100, 200, 300"
               value={amounts}
               onChange={setAmounts}
               large={true}
               />
            <button onClick={handleSubmit} className="block mx-auto px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200">
                Send Tokens
            </button>
        </div>

    )
}