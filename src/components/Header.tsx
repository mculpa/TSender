import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaGithub } from "react-icons/fa";

interface HeaderProps {
  title?: string;
  githubUrl?: string;
}

export default function Header({ 
  title = "Tsender", 
  githubUrl = "https://github.com/mculpa" 
}: HeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-green-900 bg-green-900">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      
      <div className="flex items-center gap-4">
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-white hover:bg-green-800 rounded"
        >
          <FaGithub size={30} />
        </a>
        <ConnectButton />
      </div>
    </div>
  );
}