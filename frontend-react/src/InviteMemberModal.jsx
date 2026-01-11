import { useState } from 'react';
import { X, UserPlus, Mail } from 'lucide-react';

function InviteMemberModal({ onClose, onInvite, isLoading }) {
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return alert("Introdu o adresă de email!");

        await onInvite(email);
        setEmail('');
    };

    return (
        <div className="modal-overlay">
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '0', position: 'relative' }}>

                {/* Header */}
                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <UserPlus size={20} color="var(--primary)" />
                            Invită Membru
                        </h2>
                        <button
                            onClick={onClose}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '30px' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.5' }}>
                        Introdu adresa de email a utilizatorului pe care dorești să îl adaugi în echipă.
                        Acesta va primi acces imediat ca <strong>Manager (MP)</strong>.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>EMAIL UTILIZATOR</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="email"
                                    className="input-field"
                                    placeholder="ex: coleg@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ paddingLeft: '40px' }}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn"
                                style={{ padding: '10px 20px' }}
                            >
                                Anulează
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isLoading}
                                style={{ padding: '10px 25px', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                {isLoading ? 'Se trimite...' : <><UserPlus size={18} /> Trimite Invitație</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default InviteMemberModal;
