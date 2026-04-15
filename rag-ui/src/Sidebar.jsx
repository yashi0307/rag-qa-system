// import { FaDatabase, FaComments, FaFile } from "react-icons/fa";

// function Sidebar() {
//   return (
//     <div className="sidebar">
//       <h2>⚡ RAG</h2>

//       <div className="nav-item active">
//         <FaDatabase /> Dashboard
//       </div>

//       <div className="nav-item">
//         <FaFile /> Documents
//       </div>

//       <div className="nav-item">
//         <FaComments /> Chat
//       </div>
//     </div>
//   );
// }

// export default Sidebar;

function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
    { id: 'documents', icon: '◧', label: 'Documents' },
    { id: 'chat', icon: '◎', label: 'Chat' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">⚡</div>
          <span className="logo-text">RAG</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Navigation</div>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
            style={{ background: 'none' }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-text">RAG Engine v1.0</div>
      </div>
    </aside>
  )
}

export default Sidebar