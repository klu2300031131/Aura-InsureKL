import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from local storage on mount
    const storedUser = localStorage.getItem('insureklUser');
    const storedPlan = localStorage.getItem('insureklPlan');
    const storedClaims = localStorage.getItem('insureklClaims');
    
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedPlan) setActivePlan(JSON.parse(storedPlan));
    
    if (storedClaims) {
      setClaims(JSON.parse(storedClaims));
    } else {
      // Default Mock Data for new sessions
      const initialMockClaims = [
        { 
           id: 'PR-091A-8B2', date: 'March 18, 2026', amount: '₹300', status: 'approved', 
           reason: 'High Rainfall (52.4 mm/hr) in Indiranagar',
           transactionId: 'TXN-982319-IND-POL-0x89A',
           disputeStatus: 'N/A (Auto-Executed)',
           timeToProcess: '120ms (Smart Contract)'
        },
        { 
           id: 'PR-088B-2X1', date: 'March 10, 2026', amount: '₹150', status: 'approved', 
           reason: 'Unplanned Road Closure in Koramangala',
           transactionId: 'TXN-771120-KOR-MAN-0x45B',
           disputeStatus: 'Manual Dispute: Verified by AI',
           timeToProcess: '14 mins (Dispute Resolution)'
        },
        { 
           id: 'LX-441P-009', date: 'March 02, 2026', amount: '₹0', status: 'denied', 
           reason: 'Rainfall did not meet parametric threshold (9.2 mm/hr)',
           transactionId: 'REJECTED-009',
           disputeStatus: 'Dispute Denied (Fraud Detected)',
           timeToProcess: 'N/A'
        }
      ];
      setClaims(initialMockClaims);
      localStorage.setItem('insureklClaims', JSON.stringify(initialMockClaims));
    }
    
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Simulate login logic, usually we'd verify password
    const users = JSON.parse(localStorage.getItem('insureklUsers') || '[]');
    const existing = users.find(u => u.email === email);
    
    if (existing && password === existing.password) {
      setUser(existing);
      localStorage.setItem('insureklUser', JSON.stringify(existing));
      
      // Look up if this old user previously selected a plan
      const userPlans = JSON.parse(localStorage.getItem('insureklUserPlans') || '{}');
      if (userPlans[existing.email]) {
        setActivePlan(userPlans[existing.email]);
        localStorage.setItem('insureklPlan', JSON.stringify(userPlans[existing.email]));
        return { success: true, hasPlan: true };
      }
      
      return { success: true, hasPlan: false };
    }
    return { success: false, hasPlan: false };
  };

  const register = (name, email, password) => {
    const users = JSON.parse(localStorage.getItem('insureklUsers') || '[]');
    if (users.find(u => u.email === email)) return false; // Already exists
    
    const newUser = { name, email, password, id: Date.now().toString() };
    users.push(newUser);
    localStorage.setItem('insureklUsers', JSON.stringify(users));
    
    setUser(newUser);
    localStorage.setItem('insureklUser', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    setActivePlan(null);
    localStorage.removeItem('insureklUser');
    localStorage.removeItem('insureklPlan');
  };

  const selectPlan = (plan) => {
    setActivePlan(plan);
    localStorage.setItem('insureklPlan', JSON.stringify(plan));
    
    if (user) {
      const userPlans = JSON.parse(localStorage.getItem('insureklUserPlans') || '{}');
      userPlans[user.email] = plan;
      localStorage.setItem('insureklUserPlans', JSON.stringify(userPlans));
    }
  };

  const addClaim = (claimObj) => {
    setClaims(prev => {
      const updated = [claimObj, ...prev];
      localStorage.setItem('insureklClaims', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, activePlan, claims, login, register, logout, selectPlan, addClaim, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
