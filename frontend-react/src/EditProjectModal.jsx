import { useState } from 'react';
import { X, Save } from 'lucide-react';

function EditProjectModal({ project, onClose, onSubmit }) {
    const [name, setName] = useState(project.name);
    const [desc, setDesc] = useState(project.description);
    const [repo, setRepo] = useState(project.repository);
    const [tech, setTech] = useState(project.technologies);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) return alert("Numele proiectului este obligatoriu!");

        setIsSaving(true);
        await onSubmit({
            name,
            description: desc,
            repository: repo,
            technologies: tech
        });
        setIsSaving(false);
    };

    return (
        <div className="modal-overlay">
            <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '0', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>

                {/* Header */}
                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: 'white' }}>
                            Editare Proiect
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
                    {/* Nume */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>NUME PROIECT</label>
                        <input
                            type="text"
                            className="input-field"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Descriere */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>DESCRIERE</label>
                        <textarea
                            className="input-field"
                            style={{ height: '100px', resize: 'vertical' }}
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                        />
                    </div>

                    {/* Repository */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>REPOSITORY URL</label>
                        <input
                            type="text"
                            className="input-field"
                            value={repo}
                            onChange={(e) => setRepo(e.target.value)}
                        />
                    </div>

                    {/* Tehnologii */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>TEHNOLOGII</label>
                        <input
                            type="text"
                            className="input-field"
                            value={tech}
                            onChange={(e) => setTech(e.target.value)}
                            placeholder="ex: React, Node.js"
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
                        disabled={isSaving}
                        style={{ padding: '8px 25px', fontSize: '0.9rem' }}
                    >
                        <Save size={16} /> {isSaving ? 'Se salvează...' : 'Salvează Modificări'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditProjectModal;
