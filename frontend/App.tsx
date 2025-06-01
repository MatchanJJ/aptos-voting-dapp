import { useWallet } from "@aptos-labs/wallet-adapter-react";
// Internal Components
import { Header } from "@/components/Header";

import { TopBanner } from "@/components/TopBanner";
import { ProposalList } from "./components/ProposalList";
import { CreateProposal } from "./components/CreateProposal";


function App() {
  const { connected } = useWallet();

  return (
    <>
      <TopBanner />
      <Header />
      <div className="flex items-center justify-center flex-col">
        <CreateProposal/>
        <ProposalList/>
      </div>
    </>
  );
}

export default App;
