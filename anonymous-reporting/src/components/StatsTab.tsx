import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface StatsTabProps {
  provider: ethers.BrowserProvider | null;
}

function StatsTab({ provider }: StatsTabProps) {
  const [stats, setStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    pendingReports: 0,
    successRate: '0%',
  });

  const loadStats = async () => {
    if (!provider) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      // TODO: Query smart contract for statistics
      // const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      // const total = await contract.getTotalReports();
      // const resolved = await contract.getResolvedReports();
      // const pending = await contract.getPendingReports();

      // Mock data for demo
      const total = 42;
      const resolved = 28;
      const pending = 14;
      const successRate = total > 0 ? ((resolved / total) * 100).toFixed(1) + '%' : '0%';

      setStats({
        totalReports: total,
        resolvedReports: resolved,
        pendingReports: pending,
        successRate,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      alert('Failed to load statistics');
    }
  };

  useEffect(() => {
    if (provider) {
      loadStats();
    }
  }, [provider]);

  return (
    <div className="tab-content">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalReports}</div>
          <div>Total Reports</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.resolvedReports}</div>
          <div>Resolved</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.pendingReports}</div>
          <div>Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.successRate}</div>
          <div>Success Rate</div>
        </div>
      </div>

      <div className="card">
        <h3>🔄 Refresh Statistics</h3>
        <button onClick={loadStats} className="btn btn-primary">
          📊 Update Statistics
        </button>
      </div>
    </div>
  );
}

export default StatsTab;
