import { useState } from 'react';
import { API_BASE_URL } from './config';
import { X, AlertCircle, AlertTriangle, Flame, Bug } from 'lucide-react';

function AddBugModal({ onClose, onSubmit }) {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [severity, setSeverity] = useState('Medium');
    const [priority, setPriority] = useState('Medium');
    const [file, setFile] = useState(null); // File state
    const [isUploading, setIsUploading] = useState(false);

    const [link, setLink] = useState(''); // Link state restored

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) return alert("Te rugăm să pui un titlu!");
        if (!desc.trim()) return alert("Te rugăm să descrii problema!");

        setIsUploading(true);
        let imagePath = null;

        // 1. Upload Image if exists
        if (file) {
            const formData = new FormData();
            formData.append('image', file);
            try {
                const res = await fetch(`${API_BASE_URL}/api/upload`, {
                    method: 'POST',
                    body: formData
                });
                if (res.ok) {
                    const data = await res.json();
                    imagePath = data.filePath;
                } else {
                    alert("Eroare la încărcarea imaginii!");
                    setIsUploading(false);
                    return;
                }
            } catch (err) {
                console.error("Upload failed", err);
                alert("Eroare la încărcarea imaginii!");
                setIsUploading(false);
                return;
            }
        }

        // Format formatting
        let formattedLink = link;
        if (formattedLink && !formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
            formattedLink = `https://${formattedLink}`;
        }

        // 2. Submit Bug
        onSubmit({
            title: title,
            description: desc,
            severity: severity,
            priority: priority,
            commit_link: formattedLink || 'Fără link',
            image_path: imagePath // Send path
        });
        setIsUploading(false);
    };

    return (
        <div className="modal-overlay">
            <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '0', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>

                {/* Header Professional */}
                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: 'white' }}>
                            Tichet Nou
                        </h2>
                        <button
                            onClick={onClose}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px' }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div style={{ padding: '25px', overflowY: 'auto' }}>

                    {/* TITLU */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>TITLU TICHET</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Rezumat scurt al problemei"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ fontSize: '0.95rem' }}
                        />
                    </div>

                    {/* DESCRIERE */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>DESCRIERE</label>
                        <textarea
                            className="input-field"
                            placeholder="Descrie detaliat pașii de reproducere, comportamentul așteptat și cel actual."
                            style={{ height: '120px', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.95rem', lineHeight: '1.5' }}
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        {/* SEVERITATE */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>SEVERITATE</label>
                            <div style={{ display: 'flex', gap: '1px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', padding: '2px' }}>
                                {['Low', 'Medium', 'Critical'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSeverity(s)}
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            fontSize: '0.8rem',
                                            background: severity === s ?
                                                (s === 'Critical' ? '#ef4444' : (s === 'Medium' ? '#f97316' : '#eab308'))
                                                : 'transparent',
                                            color: severity === s ? ((s === 'Low') ? 'black' : 'white') : '#94a3b8',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            fontWeight: severity === s ? '600' : '400'
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* PRIORITATE */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>PRIORITATE</label>
                            <div style={{ display: 'flex', gap: '1px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', padding: '2px' }}>
                                {['Low', 'Medium', 'High'].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPriority(p)}
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            fontSize: '0.8rem',
                                            background: priority === p ? '#334155' : 'transparent',
                                            color: priority === p ? 'white' : '#94a3b8',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            fontWeight: priority === p ? '600' : '400'
                                        }}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* FILE UPLOAD & LINK GRID */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>ATAȘAMENT (Imagine)</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{
                                        width: '100%',
                                        fontSize: '0.8rem',
                                        padding: '8px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '6px',
                                        color: '#cbd5e1'
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>LINK EXTERN</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="https://..."
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                style={{ fontSize: '0.9rem' }}
                            />
                        </div>
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
                        disabled={isUploading}
                        style={{ padding: '8px 25px', fontSize: '0.9rem', opacity: isUploading ? 0.7 : 1 }}
                    >
                        {isUploading ? 'Se procesează...' : 'Salvează'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddBugModal;