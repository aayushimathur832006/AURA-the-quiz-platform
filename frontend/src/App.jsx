import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import AuthGateway from './AuthGateway';
import Navbar from './Navbar';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('aura-user')) || null);

  const login = (userData, token) => {
    localStorage.setItem('aura-token', token);
    localStorage.setItem('aura-user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('aura-token');
    localStorage.removeItem('aura-user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// 🌤️ Compact Gauge Component mapped to Light Architecture
const RadialGauge = ({ percentage, size = 65 }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 80 ? '#0284c7' : percentage >= 50 ? '#7c3aed' : '#db2777';

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 60 60" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="30" cy="30" r={radius} fill="transparent" stroke="rgba(15, 23, 42, 0.04)" strokeWidth="6" />
        <circle 
          cx="30" cy="30" r={radius} 
          fill="transparent" 
          stroke={color} 
          strokeWidth="6" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
          strokeLinecap="round" 
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
        />
      </svg>
      <div style={{ position: 'absolute', color: '#0f172a', fontWeight: '800', fontSize: '0.85rem', fontFamily: 'monospace' }}>
        {percentage}%
      </div>
    </div>
  );
};

function CoreApp() {
  // 🔥 FIX 1: logout function ko bhi context se nikal liya yahan
  const { user, logout } = useAuth(); 
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [targetQuantity, setTargetQuantity] = useState(20);
  const [selectedProductionTopic, setSelectedProductionTopic] = useState('Web Dev');
  const [isSandboxRunning, setIsSandboxRunning] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userScoresLog, setUserScoresLog] = useState(JSON.parse(localStorage.getItem('aura-scores')) || []);
  const [currentScore, setCurrentScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); 
  const timerRef = useRef(null);

  useEffect(() => {
    if (isSandboxRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            forceCompileLogs(0, currentScore);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isSandboxRunning, currentScore]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  // const initializeAssessmentMode = async (trackType, qty) => {
  //   try {
  //     const response = await fetch('http://localhost:5000/api/generate', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         userId: user?._id || user?.id || null,
  //         domain: trackType,
  //         totalQuestions: qty,
  //         durationMinutes: 10,
  //         topic: trackType === 'production' ? selectedProductionTopic : null
  //       })
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to generate custom sandbox deployment deck");
  //     }
      
  //     const payload = await response.json();
      
  //     if (payload.quizDeck && payload.quizDeck.length > 0) {
  //       const formattedQuestions = payload.quizDeck.map((q, index) => ({
  //         id: q._id || `NODE_${Date.now()}_${index}`,
  //         q: q.question || q.q, 
  //         o: q.options || q.o,
  //         a: q.correctOptionIndex !== undefined ? q.correctOptionIndex : q.a,
  //         domain: trackType
  //       }));

  //       setCurrentScore(0);
  //       setActiveQuestions(formattedQuestions);
  //       setCurrentQuestionIndex(0);
  //       setSelectedOption(null);
  //       setTimeLeft(600);
  //       setIsSandboxRunning(true);
  //       setActiveTab('quiz-portal');
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     alert("API Routing Error: Check network log pipelines.");
  //   }
  // };
   const initializeAssessmentMode = async (trackType, qty) => {
  try {
    console.log("Track Type:", trackType);

    const response = await fetch(
      "https://aura-the-quiz-platform.onrender.com/api/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?._id || user?.id || null,
          domain: trackType,
          totalQuestions: qty,
          durationMinutes: 10,
          topic:
            trackType === "production"
              ? selectedProductionTopic
              : null,
        }),
      }
    );

    console.log("Status:", response.status);

    const payload = await response.json();
    console.log("Payload:", payload);

    if (!response.ok) {
      throw new Error(
        payload.message ||
          "Failed to generate custom sandbox deployment deck"
      );
    }

    if (!payload.quizDeck || payload.quizDeck.length === 0) {
      alert(`No questions found for "${trackType}"`);
      return;
    }

    let formattedQuestions = payload.quizDeck.map((q, index) => ({
      id: q._id || `NODE_${Date.now()}_${index}`,
      q: q.question || q.q,
      o: q.options || q.o,
      a:
        q.correctOptionIndex !== undefined
          ? q.correctOptionIndex
          : q.a,
      domain: trackType,
    }));

    // Shuffle questions
    for (let i = formattedQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [formattedQuestions[i], formattedQuestions[j]] = [
        formattedQuestions[j],
        formattedQuestions[i],
      ];
    }

    setCurrentScore(0);
    setActiveQuestions(formattedQuestions);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setTimeLeft(600);
    setIsSandboxRunning(true);
    setActiveTab("quiz-portal");
  } catch (err) {
    console.error("FULL ERROR:", err);
    alert(err.message);
  }
};
  const processNextQuestion = () => {
    if (selectedOption === null) return;
    const currentCorrect = activeQuestions[currentQuestionIndex].a;
    let nextScore = currentScore;
    if (selectedOption === currentCorrect) { 
      nextScore = currentScore + 1; 
      setCurrentScore(nextScore); 
    }
    
    if (currentQuestionIndex + 1 < activeQuestions.length) { 
      setCurrentQuestionIndex(prev => prev + 1); 
      setSelectedOption(null); 
    } else { 
      forceCompileLogs(timeLeft, nextScore); 
    }
  };

  const forceCompileLogs = (endTimeSnapshot, absoluteFinalScore) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const contextRouteLabel = activeQuestions[0]?.domain === 'academic' ? 'Academic CS Core' : `Production [${selectedProductionTopic}]`;
    const finalCalculatedPercentage = Math.round((absoluteFinalScore / activeQuestions.length) * 100);
    const telemetryReport = { 
      id: Date.now(), 
      track: contextRouteLabel, 
      totalQuestions: activeQuestions.length, 
      finalScore: absoluteFinalScore, 
      accuracyPercentage: finalCalculatedPercentage, 
      completionTimestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
      timeLeftAtEnd: formatTimer(endTimeSnapshot) 
    };
    setUserScoresLog([telemetryReport, ...userScoresLog]);
    localStorage.setItem('aura-scores', JSON.stringify([telemetryReport, ...userScoresLog]));
    setIsSandboxRunning(false); 
    setActiveQuestions([]); 
    setCurrentScore(0); 
    setActiveTab('analytics');
  };

  if (!user) return <AuthGateway />;

  return (
    <div className="animate-fade">
      {/* Structural Master Canvas Controls */}
      <div className="canvas-matrix">
        <div className="matrix-grid"></div>
        <div className="glow-orb-1"></div>
        <div className="glow-orb-2"></div>
      </div>

      {/* 🔥 FIX 2: Navbar ko logout function pass kar diya */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} isSandboxRunning={isSandboxRunning} logout={logout} />
      
      <main className="container-shell">
        
        {/* TAB 1: ACADEMIC SANDBOX MAPPER */}
        {activeTab === 'dashboard' && (
          <div className="polished-glass" style={{ borderRadius: '24px', padding: '3rem', maxWidth: '750px', margin: '0 auto', textAlign: 'center' }}>
            <div className="header-group" style={{ marginBottom: '2rem' }}>
              <div className="badge-indicator">
                <span className="pulse-node"></span>
                Academic Environment Active
              </div>
              <h1 className="h1-display">Academic <span>Sandbox</span></h1>
              <p className="p-desc">An interactive learning and testing engine to evaluate technical proficiency in fundamental computer science subjects(DSA, DBMS, OOPS, OS, and Computer Networks)</p>
            </div>

            <div style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dark-label)', letterSpacing: '0.05em', display: 'block', marginBottom: '1rem' }}>
                Select Configuration Node Capacity
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {[20, 40, 60].map(qty => (
                  <button 
                    key={qty} 
                    onClick={() => setTargetQuantity(qty)} 
                    style={{
                      flex: 1, padding: '1rem', borderRadius: '12px', fontWeight: '700', fontFamily: 'monospace', cursor: 'pointer', transition: 'all 0.2s ease',
                      background: targetQuantity === qty ? '#ffffff' : 'rgba(15,23,42,0.02)',
                      border: targetQuantity === qty ? '2px solid var(--neon-cyan)' : '1px solid var(--glass-border)',
                      color: targetQuantity === qty ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                      boxShadow: targetQuantity === qty ? '0 4px 15px var(--neon-cyan-glow)' : 'none'
                    }}
                  >
                    ⚡ {qty} NODES
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => initializeAssessmentMode('academic', targetQuantity)} className="action-trigger-btn cyan-v">
              Initialize Core Sequence
            </button>
          </div>
        )}

        {/* TAB 2: PRODUCTION HANGAR */}
        {activeTab === 'production-hangar' && (
          <div className="polished-glass" style={{ borderRadius: '24px', padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
            <div className="header-group">
              <div className="badge-indicator" style={{ color: 'var(--neon-pink)', background: 'rgba(219,39,119,0.04)', borderColor: 'rgba(219,39,119,0.15)' }}>
                <span className="pulse-node" style={{ backgroundColor: 'var(--neon-pink)' }}></span>
                System Infrastructure Deployment
              </div>
              <h1 className="h1-display">Production <span>Syllabus</span></h1>
              <p className="p-desc">Initialize workspace isolation blocks to compile performance runs and assess foundational engineering domains.</p>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <div className="module-grid-layout" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {['Web Dev', 'App Dev', 'AI/ML', 'System Design'].map(topic => {
                  const isSelected = selectedProductionTopic === topic;
                  return (
                    <div 
                      key={topic} 
                      onClick={() => setSelectedProductionTopic(topic)}
                      style={{
                        padding: '1.25rem 1.5rem', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s ease',
                        background: isSelected ? '#ffffff' : 'rgba(15,23,42,0.01)',
                        border: isSelected ? '2px solid var(--neon-pink)' : '1px solid var(--glass-border)',
                        boxShadow: isSelected ? '0 4px 15px var(--neon-pink-glow)' : 'none'
                      }}
                    >
                      <div style={{
                        width: '14px', height: '14px', borderRadius: '50%',
                        border: isSelected ? '4px solid var(--neon-pink)' : '2px solid var(--text-dark-label)',
                        background: 'transparent'
                      }} />
                      <span style={{ fontWeight: '600', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{topic} Stack</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button onClick={() => initializeAssessmentMode('production', targetQuantity)} className="action-trigger-btn pink-v">
              Compile Isolated Matrix Run
            </button>
          </div>
        )}

        {/* TAB 3: ACTIVE SYSTEM TESTING DECK */}
        {activeTab === 'quiz-portal' && isSandboxRunning && activeQuestions.length > 0 && (
          <div className="quiz-hub-container" style={{ maxWidth: '1050px', margin: '0 auto', padding: '0.5rem 0' }}>
            <div className="polished-glass card-pod" style={{ padding: '2.25rem', borderRadius: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '2.5rem', alignItems: 'stretch' }}>
                
                {/* LEFT PANEL */}
                <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--neon-cyan)', fontWeight: '800', letterSpacing: '0.05em' }}>
                        CORE_STACK_PTR // {currentQuestionIndex + 1} OF {activeQuestions.length}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(15,23,42,0.03)', padding: '0.35rem 0.85rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>TIME:</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.8rem' }}>{formatTimer(timeLeft)}</span>
                      </div>
                    </div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: '800', lineHeight: '1.45', color: 'var(--text-primary)', margin: '0' }}>
                      {activeQuestions[currentQuestionIndex].q}
                    </h2>
                  </div>
                </div>

                {/* RIGHT PANEL */}
                <div style={{ flex: '1.2 1 450px', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', borderLeft: '1px solid var(--glass-border)', paddingLeft: '2rem' }} className="quiz-options-right-panel">
                  <div className="options-stack" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {activeQuestions[currentQuestionIndex].o.map((option, idx) => {
                      const isSelected = selectedOption === idx;
                      return (
                        <div 
                          key={idx}
                          onClick={() => setSelectedOption(idx)}
                          style={{
                            display: 'flex', alignItems: 'center', padding: '1.1rem 1.25rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.18s ease-in-out',
                            background: isSelected ? '#ffffff' : 'rgba(15, 23, 42, 0.02)',
                            border: isSelected ? '2px solid var(--neon-cyan)' : '1px solid var(--glass-border)',
                            boxShadow: isSelected ? '0 4px 15px var(--neon-cyan-glow)' : 'none',
                            userSelect: 'none'
                          }}
                        >
                          <div style={{
                            width: '16px', height: '16px', borderRadius: '50%',
                            border: isSelected ? '5px solid var(--neon-cyan)' : '2px solid rgba(15, 23, 42, 0.25)',
                            background: isSelected ? '#ffffff' : 'transparent', marginRight: '1rem', transition: 'all 0.15s ease', flexShrink: 0,
                            boxShadow: isSelected ? '0 0 8px var(--neon-cyan-glow)' : 'none'
                          }} />
                          <span style={{ fontSize: '0.9rem', fontWeight: isSelected ? '700' : '500', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                            {option}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button 
                      onClick={processNextQuestion} 
                      disabled={selectedOption === null}
                      className="action-trigger-btn cyan-v"
                      style={{ 
                        width: '100%', padding: '0.9rem 2rem', borderRadius: '12px',
                        opacity: selectedOption === null ? 0.35 : 1, 
                        cursor: selectedOption === null ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease', fontWeight: '700', fontSize: '0.95rem'
                      }}
                    >
                      {currentQuestionIndex + 1 === activeQuestions.length ? 'Finalize Logs 🏁' : 'Next Node ➡️'}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HISTORICAL REGISTRY METRICS */}
        {activeTab === 'analytics' && (
          <div className="polished-glass" style={{ borderRadius: '24px', padding: '3rem', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <div className="badge-indicator" style={{ color: 'var(--neon-purple)', background: 'rgba(124,58,237,0.04)', borderColor: 'rgba(124,58,237,0.15)' }}>
                Ledger Diagnostic Registry
              </div>
              <h1 className="h1-display" style={{ fontSize: '2.4rem' }}>Registry <span>Telemetry</span></h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Maintain secure performance logs and track historical validation records of completed technical assessments.</p>
            </div>

            {userScoresLog.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dark-label)', fontFamily: 'monospace', border: '1px dashed var(--glass-border)', borderRadius: '16px' }}>
                [SYS_EMPTY]: Telemetry buffer holds zero evaluation records.
              </div>
            ) : (
              <div className="telemetry-dashboard">
                {userScoresLog.map(log => {
                  const accentColor = log.accuracyPercentage >= 80 ? 'var(--neon-cyan)' : log.accuracyPercentage >= 50 ? 'var(--neon-purple)' : 'var(--neon-pink)';
                  return (
                    <div key={log.id} className="metric-widget" style={{ borderLeft: `4px solid ${accentColor}` }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{log.track}</div>
                        <div className="pod-meta-row" style={{ marginTop: '0px' }}>
                          <span><strong>STAMP:</strong> {log.completionTimestamp}</span>
                          <span><strong>REMAINING:</strong> {log.timeLeftAtEnd}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div className="metric-value" style={{ margin: '0', fontSize: '1.4rem' }}>
                            {log.finalScore}<span style={{ fontSize: '0.8rem', color: 'var(--text-dark-label)', fontWeight: '500' }}> / {log.totalQuestions} Hits</span>
                          </div>
                          <span style={{ fontSize: '0.65rem', fontWeight: '800', fontFamily: 'monospace', color: accentColor }}>
                            {log.accuracyPercentage}% VALIDATION ACCURACY
                          </span>
                        </div>
                        <RadialGauge percentage={log.accuracyPercentage} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CoreApp />
    </AuthProvider>
  );
}
