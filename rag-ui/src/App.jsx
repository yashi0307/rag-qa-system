// import Sidebar from "./sidebar";
// import Upload from "./upload";
// import Chat from "./chat";
// import "./styles.css";

// import { FaFileAlt, FaLayerGroup, FaBolt, FaClock } from "react-icons/fa";

// function App() {
//   return (
//     <div className="app">
//       {/* Sidebar */}
//       <Sidebar />

//       {/* Main Content */}
//       <div className="content">
        
//         {/* Header */}
//         <div className="header-section">
//           <h1>RAG Engine</h1>
//           <p>Document Q&A with retrieval-augmented generation</p>
//         </div>

//         {/* Stats Cards */}
//         <div className="stats">
//           <div className="card">
//             <FaFileAlt /> <br />
//             Documents <br />
//             <b>1</b>
//           </div>

//           <div className="card">
//             <FaLayerGroup /> <br />
//             Chunks <br />
//             <b>30</b>
//           </div>

//           <div className="card">
//             <FaBolt /> <br />
//             Queries <br />
//             <b>5</b>
//           </div>

//           <div className="card">
//             <FaClock /> <br />
//             Avg Latency <br />
//             <b>700ms</b>
//           </div>
//         </div>

//         {/* Main Layout */}
//         <div className="main-grid">
//           <Upload />
//           <Chat />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;

import { useState } from 'react'
import './App.css'
import Sidebar from './Sidebar'
import Upload from './upload'
import Chat from './chat'
import Documents from './Documents'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({
    documents: 1,
    chunks: 30,
    queries: 5,
    avgLatency: '700ms'
  })

  const updateStats = (newStats) => {
    setStats(prev => ({ ...prev, ...newStats }))
  }

  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <div className="main-inner">
          {activeTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              updateStats={updateStats}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'documents' && <Documents stats={stats} updateStats={updateStats} />}
          {activeTab === 'chat' && <Chat stats={stats} updateStats={updateStats} />}
        </div>
      </div>
    </div>
  )
}

function Dashboard({ stats, updateStats, setActiveTab }) {
  return (
    <>
      {/* Top Bar */}
      <div className="topbar">
        <div className="page-title-group">
          <div className="page-eyebrow">Overview</div>
          <h1 className="page-title">RAG Engine</h1>
          <p className="page-subtitle">Document Q&A with retrieval-augmented generation</p>
        </div>
        <div className="topbar-actions">
          <div className="status-badge">
            <div className="status-dot" />
            System Online
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon="📄"
          label="Documents"
          value={stats.documents}
          trend="↑ 1 this session"
        />
        <StatCard
          icon="⚡"
          label="Chunks"
          value={stats.chunks}
          trend="Indexed"
        />
        <StatCard
          icon="💬"
          label="Queries"
          value={stats.queries}
          trend="Total asked"
        />
        <StatCard
          icon="⏱"
          label="Avg Latency"
          value={stats.avgLatency}
          trend="Response time"
          isText
        />
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        <Upload updateStats={updateStats} />
        <Chat stats={stats} updateStats={updateStats} compact />
      </div>
    </>
  )
}

function StatCard({ icon, label, value, trend, isText }) {
  return (
    <div className="stat-card">
      <div className="stat-icon-wrap">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {trend && <div className="stat-trend">↗ {trend}</div>}
    </div>
  )
}

export default App