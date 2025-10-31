import { useState } from 'react';
import { ethers } from 'ethers';

interface TrackTabProps {
  provider: ethers.BrowserProvider | null;
}

function TrackTab({ provider }: TrackTabProps) {
  const [reportId, setReportId] = useState('');
  const [reportInfo, setReportInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const trackReport = async () => {
    if (!provider) {
      alert('Please connect your wallet first');
      return;
    }

    if (!reportId) {
      alert('Please enter a report ID');
      return;
    }

    setLoading(true);

    try {
      // TODO: Query smart contract for report info
      // const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      // const info = await contract.getReport(reportId);

      // Mock data for demo
      setReportInfo({
        id: reportId,
        status: 'Investigating',
        timestamp: new Date().toLocaleString(),
        category: 'Fraud',
      });
    } catch (error) {
      console.error('Error tracking report:', error);
      alert('Failed to track report');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    const statusMap: Record<string, string> = {
      Submitted: 'status-submitted',
      Investigating: 'status-investigating',
      Resolved: 'status-resolved',
      Dismissed: 'status-dismissed',
    };
    return statusMap[status] || 'status-submitted';
  };

  return (
    <div className="tab-content">
      <div className="card">
        <h3>📋 Track Report Progress</h3>
        <div className="form-group">
          <label htmlFor="reportId">Report ID</label>
          <input
            type="number"
            id="reportId"
            className="form-control"
            placeholder="Enter your report ID"
            value={reportId}
            onChange={(e) => setReportId(e.target.value)}
          />
        </div>
        <button onClick={trackReport} className="btn btn-primary" disabled={loading}>
          {loading ? '⏳ Tracking...' : '🔍 Track Progress'}
        </button>
      </div>

      {reportInfo && (
        <div className="card">
          <h4>📊 Report Status</h4>
          <div>
            <p>
              <strong>Report ID:</strong> {reportInfo.id}
            </p>
            <p>
              <strong>Status:</strong>{' '}
              <span className={`status-badge ${getStatusClass(reportInfo.status)}`}>
                {reportInfo.status}
              </span>
            </p>
            <p>
              <strong>Category:</strong> {reportInfo.category}
            </p>
            <p>
              <strong>Submitted:</strong> {reportInfo.timestamp}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrackTab;
