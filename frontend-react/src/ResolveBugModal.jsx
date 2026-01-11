import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

function ResolveBugModal({ onClose, onSubmit }) {
    const [commitLink, setCommitLink] = useState('');
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Trimite linkul către parent
        await onSubmit(commitLink, comment);
        setIsSubmitting(false);
    };

    return (
        <div className="modal-overlay">
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '0', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                {/* Header */}
                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CheckCircle size={24} /> Rezolvă Tichet
                        </h2>
                        <button
                            onClick={onClose}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px' }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div style={{ padding: '25px' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                        Felicitări! Pentru a marca acest bug ca <strong style={{ color: 'var(--success)' }}>Rezolvat</strong>, te rugăm să adaugi link-ul către commit-ul sau Pull Request-ul care conține fix-ul.
                    </p>

                    {/* Commit Link */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>LINK COMMIT / PR (Opțional dar Recomandat)</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="https://github.com/..."
                            value={commitLink}
                            onChange={(e) => setCommitLink(e.target.value)}
                        />
                    </div>

                    {/* Comentariu Scurt */}
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>NOTĂ RAPIDĂ (Opțional)</label>
                        <textarea
                            className="input-field"
                            placeholder="Ex: Am reparat validarea..."
                            style={{ height: '80px', resize: 'vertical' }}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                        onClick={onClose}
                        className="btn"
                        style={{ padding: '8px 20px', fontSize: '0.9rem' }}
                    >
                        Anulează
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="btn btn-primary"
                        disabled={isSubmitting}
                        style={{ background: 'var(--success)', padding: '8px 25px', fontSize: '0.9rem' }}
                    >
                        {isSubmitting ? 'Se procesează...' : 'Mark as Resolved'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ResolveBugModal;
