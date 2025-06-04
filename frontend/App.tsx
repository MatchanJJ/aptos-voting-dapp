import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { TopBanner } from "@/components/TopBanner";
import { Navbar } from "./components/ui/navbar";
import { DashboardPage } from "./pages/DashboardPage";
import { CreateProposalPage } from "./pages/CreateProposalPage";
import  ProposalDetail  from "./components/ProposalDetail";

function App() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <>
        <TopBanner />
        <Header />
        <div className="flex items-center justify-center h-screen">
          <p>Please connect your wallet to continue</p>
        </div>
      </>
    );
  }

  return (
    <Router>
      <TopBanner />
      <Header />
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/create" element={<CreateProposalPage />} />
          <Route path="/proposal/:id" element={<ProposalDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
