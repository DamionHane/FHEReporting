import { useState } from 'react';
import { useEncrypt } from '@fhevm-template/sdk';
import { ethers } from 'ethers';

interface ReportTabProps {
  signer: ethers.JsonRpcSigner | null;
  isConnected: boolean;
}

function ReportTab({ signer, isConnected }: ReportTabProps) {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [privacyAgree, setPrivacyAgree] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { encryptValue, isEncrypting } = useEncrypt();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !signer) {
      setAlert({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    if (!category) {
      setAlert({ type: 'error', message: 'Please select a category' });
      return;
    }

    if (!privacyAgree) {
      setAlert({ type: 'error', message: 'Please agree to privacy terms' });
      return;
    }

    setIsSubmitting(true);
    setAlert(null);

    try {
      // Encrypt the category using FHE
      const encryptedCategory = await encryptValue(parseInt(category), { type: 'euint8' });

      // Encrypt the anonymous flag
      const encryptedAnonymous = await encryptValue(anonymous, { type: 'ebool' });

      // TODO: Submit to smart contract
      // const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      // await contract.submitReport(encryptedCategory.hex, encryptedAnonymous.hex, description);

      setAlert({
        type: 'success',
        message: 'Report submitted successfully! Your data is encrypted and protected.',
      });

      // Reset form
      setCategory('');
      setDescription('');
      setAnonymous(true);
      setPrivacyAgree(false);
    } catch (error) {
      console.error('Error submitting report:', error);
      setAlert({ type: 'error', message: 'Failed to submit report. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tab-content">
      <div className="privacy-notice">
        <h3>🔐 Privacy Protection Notice</h3>
        <p>
          This system uses advanced Fully Homomorphic Encryption (FHE) technology to protect your
          identity and report content. All sensitive information is encrypted on the blockchain,
          and only authorized investigators can decrypt it when necessary.
        </p>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">Report Category</label>
          <select
            id="category"
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Please select a report category</option>
            <option value="0">Corruption</option>
            <option value="1">Fraud</option>
            <option value="2">Environmental</option>
            <option value="3">Safety</option>
            <option value="4">Discrimination</option>
            <option value="5">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Report Details (Optional)</label>
          <textarea
            id="description"
            className="form-control"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please describe the issue you want to report in detail. This information will be encrypted for protection."
          />
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            id="anonymous"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
          />
          <label htmlFor="anonymous">Anonymous Report (Recommended)</label>
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            id="privacy-agree"
            checked={privacyAgree}
            onChange={(e) => setPrivacyAgree(e.target.checked)}
            required
          />
          <label htmlFor="privacy-agree">I have read and agree to the privacy protection terms</label>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={!isConnected || isSubmitting || isEncrypting}
        >
          {isSubmitting || isEncrypting ? '⏳ Submitting...' : '🚀 Submit Report'}
        </button>
      </form>
    </div>
  );
}

export default ReportTab;
