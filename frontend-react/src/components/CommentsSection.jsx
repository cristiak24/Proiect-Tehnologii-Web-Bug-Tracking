import { useState, useEffect, useRef } from 'react';
import { Send, User, Image as ImageIcon, X } from 'lucide-react';
import { API_BASE_URL } from '../config';

/**
 * Componenta pentru afișarea și adăugarea comentariilor la un Bug.
 * Props:
 * - bugId: ID-ul bug-ului curent
 * - user: Utilizatorul logat (pentru a posta)
 */
function CommentsSection({ bugId, user }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState(null); // Imagine atașată
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadComments();
    }, [bugId]);

    const loadComments = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/comments/${bugId}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (e) {
            console.error("Eroare la încărcarea comentariilor:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSend = async () => {
        if (!newComment.trim() && !file) return;

        setIsUploading(true);
        let imagePath = null;

        try {
            // 1. Upload Image request
            if (file) {
                const formData = new FormData();
                formData.append('image', file);
                const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
                    method: 'POST',
                    body: formData
                });
                if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    imagePath = data.filePath;
                } else {
                    alert("Eroare la upload imagine!");
                    setIsUploading(false);
                    return;
                }
            }

            // 2. Post Comment
            const res = await fetch(`${API_BASE_URL}/api/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: newComment || '(Imagine atașată)', // Fallback text
                    bug_id: bugId,
                    user_id: user.id,
                    image_path: imagePath
                })
            });

            if (res.ok) {
                const savedComment = await res.json();
                setComments([...comments, savedComment]);
                setNewComment('');
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        } catch (e) {
            console.error("Eroare la trimiterea comentariului:", e);
        } finally {
            setIsUploading(false);
        }
    };

    // Funcție helper pentru formatarea datei
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('ro-RO', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#94a3b8' }}>💬 Discuție ({comments.length})</h4>

            {/* Lista Comentarii */}
            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px', paddingRight: '5px' }}>
                {loading && <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Se încarcă...</p>}

                {!loading && comments.length === 0 && (
                    <p style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>Niciun comentariu adăugat.</p>
                )}

                {comments.map(c => (
                    <div key={c.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>
                                {c.User ? (c.User.name || c.User.email) : 'Anonim'}
                            </span>
                            <span style={{ color: '#64748b' }}>{formatDate(c.createdAt)}</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap', color: '#e2e8f0' }}>{c.text}</div>

                        {/* Imagine Comentariu */}
                        {c.image_path && (
                            <div style={{ marginTop: '8px' }}>
                                <a href={`${API_BASE_URL}${c.image_path}`} target="_blank" rel="noreferrer">
                                    <img
                                        src={`${API_BASE_URL}${c.image_path}`}
                                        alt="attachment"
                                        style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                                    />
                                </a>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Previzualizare fișier selectat */}
            {file && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', background: 'rgba(59, 130, 246, 0.1)', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    <ImageIcon size={14} color="var(--primary)" />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                    <button
                        onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Input Adăugare */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <input
                        type="text"
                        placeholder="Scrie un comentariu..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '6px',
                            padding: '10px',
                            color: 'white',
                            outline: 'none',
                            fontSize: '0.9rem'
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                </div>

                {/* Buton Upload */}
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Atașează imagine"
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '6px',
                        padding: '10px',
                        color: '#cbd5e1',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <ImageIcon size={20} />
                </button>

                <button
                    onClick={handleSend}
                    disabled={isUploading}
                    style={{
                        background: 'var(--primary)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '10px 15px',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: isUploading ? 0.7 : 1
                    }}
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
}

export default CommentsSection;
