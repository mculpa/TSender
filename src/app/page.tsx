"use client";

import HomeContent from "@/components/HomeComponent";
import { useAccount} from "wagmi";


export default function Home() {
  const { isConnected } = useAccount();
  return (
    <div>
      { isConnected ? (
        <div>
          <HomeContent />
        </div> 
      
       ) : (
        <div>
          Please connect a wallet...
        </div> 
      )
      }
      </div> 
  );
}
