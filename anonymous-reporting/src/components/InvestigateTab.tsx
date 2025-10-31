import { useState } from 'react';
import { useDecrypt } from '@fhevm-template/sdk';
import { ethers } from 'ethers';

interface InvestigateTabProps {
  signer: ethers.JsonRpcSigner | null;
  isConnected: boolean;
}

function InvestigateTab({ signer, isConnected }: InvestigateTabProps) {
  const [reportId, setReportId] = useState('');
  const [newStatus, setNewStatus] = useState('1');
  const [notes, setNotes] = useState('');
  const [investigatorAddress, setInvestigatorAddress] = useState('');

  const { decrypt } = useDecrypt();

  const updateReportStatus = async () => {
    if (!isConnected || !signer) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      // TODO: Call smart contract to update status
      // const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      // await contract.updateReportStatus(reportId, newStatus);

      alert('Report status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const addNotes = async () => {
    if (!isConnected || !signer) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      // TODO: Call smart contract to add notes
      alert('Notes added successfully');
      setNotes('');
    } catch (error) {
      console.error('Error adding notes:', error);
      alert('Failed to add notes');
    }
  };

  const addInvestigator = async () => {
    if (!isConnected || !signer) {
      alert('Please connect your wallet first');
      return;
    }

    if (!ethers.isAddress(investigatorAddress)) {
      alert('Invalid Ethereum address');
      return;
    }

    try {
      // TODO: Call smart contract to add investigator
      alert('Investigator added successfully');
      setInvestigatorAddress('');
    } catch (error) {
      console.error('Error adding investigator:', error);
      alert('Failed to add investigator');
    }
  };

  const removeInvestigator = async () => {
    if (!isConnected || !signer) {
      alert('Please connect your wallet first');
      return;
    }

    if (!ethers.isAddress(investigatorAddress)) {
      alert('Invalid Ethereum address');
      return;
    }

    try {
      // TODO: Call smart contract to remove investigator
      alert('Investigator removed successfully');
      setInvestigatorAddress('');
    } catch (error) {
      console.error('Error removing investigator:', error);
      alert('Failed to remove investigator');
    }
  };

  return (
    <div className="tab-content">
      <div className="card">
        <h3>🔍 Investigator Management Panel</h3>
        <p>Only authorized investigators and system administrators can use this feature.</p>

        <div className="form-group">
          <label htmlFor="investigateReportId">Report ID</label>
          <input
            type="number"
            id="investigateReportId"
            className="form-control"
            placeholder="Enter report ID to process"
            value={reportId}
            onChange={(e) => setReportId(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="newStatus">Update Status</label>
          <select
            id="newStatus"
            className="form-control"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="1">Under Investigation</option>
            <option value="2">Resolved</option>
            <option value="3">Dismissed</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Investigation Notes</label>
          <textarea
            id="notes"
            className="form-control"
            rows={4}
            placeholder="Add investigation notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button onClick={updateReportStatus} className="btn btn-warning" disabled={!isConnected}>
          📝 Update Status
        </button>{' '}
        <button onClick={addNotes} className="btn btn-success" disabled={!isConnected}>
          📋 Add Notes
        </button>
      </div>

      <div className="card">
        <h4>👥 Investigator Management</h4>
        <div className="form-group">
          <label htmlFor="investigatorAddress">Investigator Address</label>
          <input
            type="text"
            id="investigatorAddress"
            className="form-control"
            placeholder="0x..."
            value={investigatorAddress}
            onChange={(e) => setInvestigatorAddress(e.target.value)}
          />
        </div>
        <button onClick={addInvestigator} className="btn btn-success" disabled={!isConnected}>
          ➕ Add Investigator
        </button>{' '}
        <button onClick={removeInvestigator} className="btn btn-danger" disabled={!isConnected}>
          ❌ Remove Investigator
        </button>
      </div>
    </div>
  );
}

export default InvestigateTab;
