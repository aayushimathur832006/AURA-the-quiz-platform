import React from 'react';


export default function Navbar({ activeTab, setActiveTab, isSandboxRunning, user, logout }) {
  return (
    <header className="mainframe-navbar" style={{
      position: 'fixed', top: 0, left: 0, width: '100%', display: 'flex', 
      justifyContent: 'space-between', padding: '1rem 2rem', background: 'rgba(0,0,0,0.8)', 
      backdropFilter: 'blur(10px)', zIndex: 1000, borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div className="logo-mono" style={{color: 'var(--neon-cyan)', fontWeight: 'bold', fontFamily: 'monospace'}}>AURA // ENGINE</div>
      
      <nav className="tab-controller" style={{ display: 'flex', gap: '1rem', opacity: isSandboxRunning ? 0.4 : 1, pointerEvents: isSandboxRunning ? 'none' : 'auto' }}>
        <button onClick={() => setActiveTab('dashboard')} className={`tab-trigger ${activeTab === 'dashboard' ? 'active' : ''}`}>Academic</button>
        <button onClick={() => setActiveTab('production-hangar')} className={`tab-trigger ${activeTab === 'production-hangar' ? 'active' : ''}`}>Production</button>
        <button onClick={() => setActiveTab('analytics')} className={`tab-trigger ${activeTab === 'analytics' ? 'active' : ''}`}>Records</button>
      </nav>

      <div style={{display: 'flex', alignItems: 'center', gap: '1rem', color: 'white'}}>
       
<span className="text-sm text-gray-300">
  <span className="font-semibold text-white">{user?.name || 'User'}</span>
</span>
        <button onClick={logout} className="disconnect-action" style={{ opacity: isSandboxRunning ? 0.3 : 1, pointerEvents: isSandboxRunning ? 'none' : 'auto', background: 'red', color: 'white', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
      </div>
    </header>
  );
}