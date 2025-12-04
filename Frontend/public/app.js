const API_URL = "http://localhost:3000/api";
let currentUser = null;
let currentProjectId = null;
let userRole = null;

// ===============================
// 1. AUTH & NAVIGARE
// ===============================

async function login() {
    // 1. Luăm valorile din noile input-uri
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        alert("Te rog completează emailul și parola!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            
            // Actualizăm Navbar-ul
            document.getElementById('current-user').innerText = currentUser.email;
            document.getElementById('user-info').style.display = 'flex'; // Afișăm zona de user
            
            showDashboard();
        } else {
            alert("Eroare: " + data.error);
        }
    } catch (err) {
        console.error(err);
        alert("Nu s-a putut conecta la server.");
    }
}

function logout() {
    currentUser = null;
    location.reload(); // Reîmprospătare pagină pentru a ieși
}

function showDashboard() {
    // Ascundem toate secțiunile
    document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
    
    // Afișăm Dashboard
    document.getElementById('dashboard-view').style.display = 'block';
    
    loadProjects();
}

// ===============================
// 2. DASHBOARD (PROIECTE)
// ===============================

async function loadProjects() {
    const list = document.getElementById('projects-list');
    list.innerHTML = '<p style="text-align:center; width:100%">Se încarcă proiectele...</p>';

    try {
        const response = await fetch(`${API_URL}/projects`);
        const projects = await response.json();
        
        list.innerHTML = ''; // Golim lista

        if (projects.length === 0) {
            list.innerHTML = '<p>Nu există proiecte active.</p>';
            return;
        }

        projects.forEach(p => {
            // Aici construim CARDURILE noi
            const div = document.createElement('div');
            div.className = 'project-card';
            
            div.innerHTML = `
                <div>
                    <h3>${p.name}</h3>
                    <small>Repo: <a href="${p.repository}" target="_blank">${p.repository}</a></small>
                </div>
                <div style="margin-top: 15px;">
                    <button onclick="openProject(${p.id}, '${p.name}')" class="btn btn-primary" style="width:100%">
                        Deschide Proiect & Bug-uri
                    </button>
                </div>
            `;
            list.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        list.innerHTML = '<p style="color:red">Eroare la încărcare.</p>';
    }
}

// Funcție nouă: Adăugare Proiect (Dacă backend-ul o suportă)
async function addProject() {
    const name = document.getElementById('new-project-name').value;
    const repo = document.getElementById('new-project-repo').value;

    if (!name || !repo) return alert("Completează numele și repo-ul!");

    // Notă: Trebuie să ne asigurăm că avem ruta POST /api/projects în server.js
    // Dacă nu o avem, o vom adăuga imediat.
    alert("Funcționalitate în lucru! (Necesită actualizare server)");
}

// ===============================
// 3. PAGINA DE PROIECT (DETALII)
// ===============================

async function openProject(id, name) {
    currentProjectId = id;
    
    // Schimbăm View-ul
    document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
    document.getElementById('project-view').style.display = 'block';
    
    document.getElementById('project-title').innerText = name;
    
    // Verificăm ce rol avem (MP sau TST)
    await checkRole();
    
    // Încărcăm bug-urile
    loadBugs();
}

async function checkRole() {
    const response = await fetch(`${API_URL}/projects/${currentProjectId}/role?userId=${currentUser.id}`);
    const data = await response.json();
    userRole = data.role;

    // Resetăm interfața
    document.getElementById('btn-join-tester').style.display = 'none';
    document.getElementById('add-bug-area').style.display = 'none';

    if (userRole === null) {
        // Nu sunt membru -> Văd butonul de JOIN
        document.getElementById('btn-join-tester').style.display = 'block';
    } else if (userRole === 'TST') {
        // Sunt Tester -> Văd formularul de ADĂUGARE
        document.getElementById('add-bug-area').style.display = 'block';
    }
    // MP vede totul implicit (fără butoane de join/add bug)
}

async function joinAsTester() {
    await fetch(`${API_URL}/projects/${currentProjectId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
    });
    alert("Te-ai alăturat echipei ca Tester!");
    checkRole();
}

// ===============================
// 4. BUG-URI (LOGICA NOUĂ DE AFIȘARE)
// ===============================

async function reportBug() {
    const desc = document.getElementById('bug-desc').value;
    const severity = document.getElementById('bug-severity').value;
    const priority = document.getElementById('bug-priority').value;
    const commit = document.getElementById('bug-commit').value;

    if (!desc) return alert("Descrierea este obligatorie!");

    await fetch(`${API_URL}/bugs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            project_id: currentProjectId,
            reporter_id: currentUser.id,
            description: desc,
            severity: severity,
            priority: priority,
            commit_link: commit
        })
    });

    // Reset form
    document.getElementById('bug-desc').value = '';
    loadBugs();
}

async function loadBugs() {
    const list = document.getElementById('bugs-list');
    list.innerHTML = '<p>Se actualizează lista...</p>';

    const response = await fetch(`${API_URL}/projects/${currentProjectId}/bugs`);
    const bugs = await response.json();

    list.innerHTML = '';
    
    if (bugs.length === 0) {
        list.innerHTML = '<div style="text-align:center; padding:20px; color:#666;">🐞 Niciun bug raportat. Totul e curat!</div>';
        return;
    }

    bugs.forEach(bug => {
        // Alegem clasa CSS corectă (verde, portocaliu, roșu)
        let cssClass = 'bug-low';
        if (bug.severity === 'Critical') cssClass = 'bug-critical';
        if (bug.severity === 'Medium') cssClass = 'bug-medium';

        const li = document.createElement('li');
        li.className = `bug-item ${cssClass}`;

        // Butonul de rezolvare (Doar pentru MP și dacă nu e deja închis)
        let actionButton = '';
        if (userRole === 'MP' && bug.status !== 'Closed') {
            actionButton = `
                <div class="bug-actions">
                    <button onclick="resolveBug(${bug.id})" class="btn btn-primary btn-sm">
                        ✅ Marchează Rezolvat
                    </button>
                </div>
            `;
        }

        li.innerHTML = `
            <div class="bug-header">
                <span>${bug.description}</span>
                <span class="status-badge" style="background:${bug.status === 'Closed' ? '#22c55e' : '#64748b'}; color:white">
                    ${bug.status}
                </span>
            </div>
            <div class="bug-meta">
                <span>⚡ Severitate: <b>${bug.severity}</b></span>
                <span>🔥 Prioritate: <b>${bug.priority}</b></span>
            </div>
            <div style="font-size: 0.9rem;">
                🔗 <a href="${bug.commit_link}" target="_blank" style="color:var(--accent-blue)">Commit Eroare</a>
                ${bug.fix_link ? ` | ✅ <a href="${bug.fix_link}" target="_blank" style="color:green">Commit Rezolvare</a>` : ''}
            </div>
            ${actionButton}
        `;
        list.appendChild(li);
    });
}

async function resolveBug(bugId) {
    const fixLink = prompt("Introdu link-ul către commit-ul de rezolvare:");
    if (!fixLink) return;

    await fetch(`${API_URL}/bugs/${bugId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            status: 'Closed',
            assigned_to: currentUser.id,
            fix_link: fixLink
        })
    });
    loadBugs();
}