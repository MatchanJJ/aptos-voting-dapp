import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { TopBanner } from "@/components/TopBanner";
import DashboardPage from "./pages/DashboardPage";
import { CreateProposalPage } from "./pages/CreateProposalPage";
import VotingPage from "./pages/VotingPage";
import ProposalDetail from "./components/ProposalDetail";

function App() {
  const { connected } = useWallet();

  return (
    <Router>
      <TopBanner />
      <Header />
      {!connected ? (
        <div className="flex items-center justify-center h-screen">
          <p>Please connect your wallet to continue</p>
        </div>
      ) : (
        <>
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/voting" element={<VotingPage />} />
              <Route path="/create" element={<CreateProposalPage />} />
              <Route path="/proposal/:id" element={<ProposalDetail />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </>
      )}
    </Router>
  );
}

export default App;
