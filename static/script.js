/**
 * HeartGuard AI - Core Logic
 */

// State
let currentStep = 1;
const totalSteps = 3;

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Set date
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('en-US', dateOptions);

    // Disable scroll if intro overlay is visible
    if (!document.getElementById('introOverlay').classList.contains('hidden')) {
        document.body.classList.add('no-scroll');
    }

    // Check auth status
    checkAuthStatus();

    // Initial state for history API
    history.replaceState({ tab: 'home' }, '', '#home');

    // Windows Enter Key Navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const activeEl = document.activeElement;
            if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'SELECT')) {
                e.preventDefault();
                const form = activeEl.closest('form');
                if (form) {
                    const inputs = Array.from(form.querySelectorAll('input:not([type="hidden"]), select'));
                    const index = inputs.indexOf(activeEl);
                    if (index > -1 && index < inputs.length - 1) {
                        inputs[index + 1].focus();
                    } else if (index === inputs.length - 1) {
                        // If it's the last input of a step, click next or submit
                        const step = activeEl.closest('.form-step');
                        const nextBtn = step.querySelector('.btn-primary, .btn-submit');
                        if (nextBtn) nextBtn.click();
                    }
                }
            }
        }
    });
});

// Handle browser back button
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.tab) {
        switchTab(null, event.state.tab, true);
    }
});

// Mobile Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar.classList.toggle('open');
    if (sidebar.classList.contains('open')) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    };
}

// Landing Login Logic
function handleLandingLogin(e) {
    e.preventDefault();
    const user = document.getElementById('landingUser').value;
    const pass = document.getElementById('landingPass').value;

    // Using existing login API
    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
    }).then(r => r.json().then(data => ({ status: r.status, data: data })))
        .then(result => {
            if (result.status === 200) {
                // Success - close intro and update UI
                document.getElementById('introOverlay').classList.add('hidden');
                document.body.classList.remove('no-scroll');
                checkAuthStatus();
            } else {
                // Show actual error message from server
                alert(result.data.error || 'Login failed');
            }
        }).catch(err => {
            console.error('Login error:', err);
            alert('Network error during login. Please try again.');
        });
}

function enterAppAsGuest() {
    document.getElementById('introOverlay').classList.add('hidden');
    document.body.classList.remove('no-scroll');
}

function enterApp() {
    document.getElementById('introOverlay').classList.add('hidden');
    document.body.classList.remove('no-scroll');
}

// Navigation Functions
function switchTab(event, tabId, isBack = false) {
    if (event) event.preventDefault();
    console.log(`Navigating to: ${tabId}`);

    // 1. Update Navigation Bar State
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.classList.remove('active');
        try {
            const onclickAttr = String(li.getAttribute('onclick') || '');
            if (onclickAttr && onclickAttr.includes(`'${tabId}'`)) {
                li.classList.add('active');
            }
        } catch (e) {
            console.warn('Error matching nav link:', e);
        }
    });

    // 2. Update View Section
    document.querySelectorAll('.view-section').forEach(view => view.classList.remove('active'));
    const targetView = document.getElementById(tabId);
    if (targetView) {
        targetView.classList.add('active');
    } else {
        console.error(`Tab ${tabId} not found`);
    }

    // 3. Special Actions
    if (tabId === 'history') loadHistory();

    // 4. Update History State (for back button)
    if (!isBack) {
        history.pushState({ tab: tabId }, '', `#${tabId}`);
    }

    // 5. Scroll to top
    window.scrollTo(0, 0);
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.scrollTop = 0;

    // Close sidebar if open (mobile)
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('open')) {
        toggleSidebar();
    }
}

// Stepper Logic
function nextStep(step) {
    // Validate current step
    if (!validateStep(currentStep)) return;

    // Update UI
    document.getElementById(`step${currentStep}`).classList.remove('active');
    document.getElementById(`step${step}`).classList.add('active');

    // Update Stepper Indicators
    const indicators = document.querySelectorAll('.step');
    indicators.forEach(ind => {
        const s = parseInt(ind.dataset.step);
        if (s < step) ind.classList.add('completed');
        if (s === step) ind.classList.add('active');
        if (s > step) ind.classList.remove('active', 'completed');
    });

    currentStep = step;
}

function prevStep(step) {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    document.getElementById(`step${step}`).classList.add('active');

    const indicators = document.querySelectorAll('.step');
    indicators.forEach(ind => {
        const s = parseInt(ind.dataset.step);
        if (s === step) {
            ind.classList.add('active');
            ind.classList.remove('completed');
        }
        if (s > step) ind.classList.remove('active', 'completed');
    });

    currentStep = step;
}

function validateStep(step) {
    const container = document.getElementById(`step${step}`);
    const inputs = container.querySelectorAll('input, select');
    let valid = true;

    inputs.forEach(input => {
        if (!input.checkValidity()) {
            input.reportValidity();
            valid = false;
        }
    });

    return valid;
}

// Prediction Logic
function submitAssessment() {
    if (!validateStep(3)) return;

    // Collect Data
    const formData = {
        age: parseInt(document.getElementById('age').value),
        sex: parseInt(document.getElementById('sex').value),
        chest_pain_type: parseInt(document.getElementById('chest_pain_type').value),
        resting_blood_pressure: parseInt(document.getElementById('resting_blood_pressure').value),
        cholesterol: parseInt(document.getElementById('cholesterol').value),
        fasting_blood_sugar: parseInt(document.getElementById('fasting_blood_sugar').value),
        resting_ecg: parseInt(document.getElementById('resting_ecg').value),
        max_heart_rate: parseInt(document.getElementById('max_heart_rate').value),
        exercise_induced_angina: parseInt(document.getElementById('exercise_induced_angina').value),
        st_depression: parseFloat(document.getElementById('st_depression').value),
        st_slope: parseInt(document.getElementById('st_slope').value),
        major_vessels: parseInt(document.getElementById('major_vessels').value),
        thalassemia: parseInt(document.getElementById('thalassemia').value)
    };

    // Show Loading
    const loading = document.getElementById('loadingOverlay');
    loading.classList.remove('hidden');

    // API Call
    fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
        .then(res => res.json())
        .then(data => {
            loading.classList.add('hidden');
            if (data.error) {
                alert(data.error);
                return;
            }
            showResults(data, formData);
        })
        .catch(err => {
            loading.classList.add('hidden');
            alert('Error connecting to server.');
            console.error(err);
        });
}

function showResults(data, inputData) {
    // Hide Form, Show Dashboard
    document.getElementById('assessmentForm').classList.add('hidden');
    document.querySelector('.stepper').classList.add('hidden');
    const dashboard = document.getElementById('resultsDashboard');
    dashboard.classList.remove('hidden');

    // Update Metrics
    document.getElementById('resBP').innerText = `${inputData.resting_blood_pressure} mmHg`;
    document.getElementById('resChol').innerText = `${inputData.cholesterol} mg/dl`;
    document.getElementById('resHR').innerText = `${inputData.max_heart_rate} bpm`;

    // Update Gauge
    const percent = data.risk_percentage;
    const circle = document.querySelector('.progress-ring__circle');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percent / 100) * circumference;

    circle.style.strokeDashoffset = offset;
    document.getElementById('riskPercentage').innerText = `${percent}%`;

    // Classes & Level Text
    let riskClass = 'low';
    let levelText = 'Low Risk';
    let color = '#34d399'; // Emerald

    if (percent >= 34) {
        riskClass = 'moderate';
        levelText = 'Moderate Risk';
        color = '#fbbf24'; // Amber
    }
    if (percent >= 67) {
        riskClass = 'high';
        levelText = 'High Risk';
        color = '#f87171'; // Red
    }

    circle.style.stroke = color;
    const riskBadge = document.getElementById('riskLevelText');

    // Clear old classes and add new one
    riskBadge.classList.remove('low', 'moderate', 'high');
    riskBadge.classList.add(riskClass);
    riskBadge.style.backgroundColor = ''; // Clear inline styles
    riskBadge.style.color = '';
    riskBadge.innerText = levelText;

    document.getElementById('riskMessage').innerText = data.message;

    // Precautions List
    const pList = document.getElementById('precautionsList');
    pList.innerHTML = '';
    data.precautions.precautions.forEach(p => {
        const li = document.createElement('li');
        li.innerText = p.replace(/^• /, '');
        pList.appendChild(li);
    });

    // Diet Lists
    const eatList = document.getElementById('dietEatList');
    const avoidList = document.getElementById('dietAvoidList');
    eatList.innerHTML = '';
    avoidList.innerHTML = '';

    data.diet_plan.foods_to_eat.forEach(f => {
        const li = document.createElement('li');
        li.innerHTML = f.replace('[OK] ', '<i class="fa-solid fa-check text-success"></i> ');
        eatList.appendChild(li);
    });

    data.diet_plan.foods_to_avoid.forEach(f => {
        const li = document.createElement('li');
        li.innerHTML = f.replace('[NO] ', '<i class="fa-solid fa-ban text-danger"></i> ');
        avoidList.appendChild(li);
    });
}

function resetAssessment() {
    document.getElementById('resultsDashboard').classList.add('hidden');
    document.getElementById('assessmentForm').classList.remove('hidden');
    document.querySelector('.stepper').classList.remove('hidden');
    document.getElementById('assessmentForm').reset();

    // Reset Stepper
    currentStep = 1;
    document.querySelectorAll('.step').forEach(s => {
        s.classList.remove('active', 'completed');
    });
    document.querySelector('.step[data-step="1"]').classList.add('active');

    // Reset Form Steps
    document.querySelectorAll('.form-step').forEach(fs => fs.classList.remove('active'));
    document.getElementById('step1').classList.add('active');

    // Reset gauge
    document.querySelector('.progress-ring__circle').style.strokeDashoffset = 440;
}

// History Functions
function loadHistory() {
    const tbody = document.getElementById('historyBody');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Loading...</td></tr>';

    fetch('/api/history')
        .then(r => r.json())
        .then(data => {
            tbody.innerHTML = '';
            if (!data.history || data.history.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">No records found.</td></tr>';
                return;
            }

            data.history.forEach(row => {
                const tr = document.createElement('tr');
                const rowDate = new Date(row.created_at);

                let badgeClass = 'bg-green-100 text-green-800'; // simplified styles
                let badgeStyle = 'background:#dcfce7; color:#166534; padding:4px 8px; border-radius:12px; font-weight:600; font-size:0.8rem';

                if (row.risk_level === 'MODERATE_RISK') badgeStyle = 'background:#fef3c7; color:#92400e; padding:4px 8px; border-radius:12px; font-weight:600; font-size:0.8rem';
                if (row.risk_level === 'HIGH_RISK') badgeStyle = 'background:#fee2e2; color:#991b1b; padding:4px 8px; border-radius:12px; font-weight:600; font-size:0.8rem';

                tr.innerHTML = `
                <td>${rowDate.toLocaleDateString()}</td>
                <td>${row.age}</td>
                <td>${row.resting_blood_pressure}</td>
                <td>${row.cholesterol}</td>
                <td><span style="${badgeStyle}">${row.risk_level.replace('_', ' ')}</span></td>
                <td><button class="btn btn-secondary" style="padding:4px 8px; font-size:0.8rem; min-width:60px;" onclick='viewDetails(${JSON.stringify(row)})'>View</button></td>
            `;
                // Store raw date for filtering
                tr.dataset.date = rowDate.toISOString().split('T')[0];
                tbody.appendChild(tr);
            });

            // Apply filter if exists
            filterHistory();
        });
}

function filterHistory() {
    const filterValue = document.getElementById('historyDateFilter').value;
    const rows = document.querySelectorAll('#historyBody tr:not(.no-results-row)');
    const tbody = document.getElementById('historyBody');

    // Remove existing no-results message
    const existingMsg = document.querySelector('.no-results-row');
    if (existingMsg) existingMsg.remove();

    let visibleCount = 0;
    rows.forEach(row => {
        if (!filterValue) {
            row.style.display = '';
            visibleCount++;
            return;
        }

        if (row.dataset.date === filterValue) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    if (visibleCount === 0) {
        const noDataRow = document.createElement('tr');
        noDataRow.className = 'no-results-row';
        noDataRow.innerHTML = `<td colspan="6" style="text-align:center; padding: 2rem; color: #94a3b8;"><i class="fa-solid fa-magnifying-glass" style="margin-bottom:0.5rem; display:block; font-size:1.2rem;"></i> No assessment records found for this date.</td>`;
        tbody.appendChild(noDataRow);
    }
}

// Result Details Functions
function viewDetails(data) {
    const modal = document.getElementById('historyDetailsModal');
    const date = new Date(data.created_at);

    document.getElementById('detailsDate').innerText = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('detAge').innerText = data.age;
    document.getElementById('detBP').innerText = data.resting_blood_pressure + ' mmHg';
    document.getElementById('detChol').innerText = data.cholesterol + ' mg/dl';
    document.getElementById('detHR').innerText = data.max_heart_rate + ' bpm';

    const badge = document.getElementById('detailsRiskBadge');
    badge.innerText = data.risk_level.replace('_', ' ');
    badge.className = 'risk-badge ' + data.risk_level.toLowerCase().split('_')[0];

    document.getElementById('detailsRiskPercent').innerText = `Risk Percentage: ${data.risk_percentage}%`;
    document.getElementById('detailsMsg').innerText = `Diagnosis: ${data.risk_percentage >= 50 ? 'Heart Disease Risk Detected' : 'Low Heart Disease Risk'}`;

    // Fetch and populate advice sections
    const precList = document.getElementById('detPrecautionsList');
    const eatList = document.getElementById('detDietEatList');
    const avoidList = document.getElementById('detDietAvoidList');

    precList.innerHTML = '<li><i class="fa-solid fa-spinner fa-spin"></i> Loading advice...</li>';
    eatList.innerHTML = '';
    avoidList.innerHTML = '';

    fetch(`/api/get-content?risk_level=${data.risk_level}`)
        .then(r => r.json())
        .then(content => {
            // Precautions
            precList.innerHTML = '';
            content.precautions.precautions.forEach(p => {
                const li = document.createElement('li');
                li.innerText = p.replace(/^• /, '');
                precList.appendChild(li);
            });

            // Diet Eat
            eatList.innerHTML = '';
            content.diet_plan.foods_to_eat.forEach(f => {
                const li = document.createElement('li');
                li.innerHTML = f.replace('[OK] ', '<i class="fa-solid fa-check text-success"></i> ');
                eatList.appendChild(li);
            });

            // Diet Avoid
            avoidList.innerHTML = '';
            content.diet_plan.foods_to_avoid.forEach(f => {
                const li = document.createElement('li');
                li.innerHTML = f.replace('[NO] ', '<i class="fa-solid fa-ban text-danger"></i> ');
                avoidList.appendChild(li);
            });
        })
        .catch(err => {
            precList.innerHTML = '<li>Error loading advice.</li>';
            console.error(err);
        });

    modal.classList.add('active');
    document.body.classList.add('no-scroll');
}

function closeHistoryDetails() {
    document.getElementById('historyDetailsModal').classList.remove('active');
    document.body.classList.remove('no-scroll');
}


function clearHistory() {
    if (!confirm('Are you sure you want to delete all history?')) return;

    fetch('/api/clear-history', { method: 'POST' })
        .then(r => {
            if (r.status === 401) {
                alert('Please login first to clear history.');
                openLoginModal();
                return;
            }
            return r.json();
        })
        .then(data => {
            if (data && data.message) {
                loadHistory(); // refresh
            }
        });
}

// Auth Mockup
function openLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    document.body.classList.add('no-scroll');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
    document.body.classList.remove('no-scroll');
}

function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
    }).then(r => r.json().then(data => ({ status: r.status, data: data })))
        .then(result => {
            if (result.status === 200) {
                // Success - close modal and update UI
                closeLoginModal();
                checkAuthStatus();
            } else {
                // Show actual error message from server
                alert(result.data.error || 'Invalid credentials');
            }
        }).catch(err => {
            console.error('Login error:', err);
            alert('Network error during login. Please try again.');
        });
}

function checkAuthStatus() {
    fetch('/api/auth-status').then(r => r.json()).then(data => {
        const container = document.getElementById('userProfile');
        const welcomeHeader = document.getElementById('welcomeUser');

        if (data.logged_in) {
            // Hide intro if still visible
            const intro = document.getElementById('introOverlay');
            if (intro && !intro.classList.contains('hidden')) {
                intro.classList.add('hidden');
                document.body.classList.remove('no-scroll');
            }

            // Update Header
            if (welcomeHeader) welcomeHeader.innerText = `Hello, ${data.user}!`;

            // Update Sidebar Profile
            container.innerHTML = `
                <div class="login-card-ref logged-in-state">
                    <div class="user-avatar-circle">
                        ${data.user.charAt(0).toUpperCase()}
                    </div>
                    <div class="user-info-text">
                        <p class="user-name">${data.user}</p>
                        <p class="user-role">Member</p>
                    </div>
                    <button class="btn-logout-icon" onclick="logout()" title="Logout">
                        <i class="fa-solid fa-power-off"></i>
                    </button>
                </div>
            `;
        } else {
            // Reset Header
            if (welcomeHeader) welcomeHeader.innerText = 'Hello, Guest!';

            // Revert Sidebar
            container.innerHTML = `
                <div class="login-card-ref">
                    <p class="login-text-ref">MEMBER LOGIN</p>
                    <button class="login-btn-ref" onclick="openLoginModal()">
                        <i class="fa-solid fa-user"></i> Sign In
                    </button>
                </div>
            `;
        }
    });
}

function logout() {
    fetch('/api/logout', { method: 'POST' }).then(() => {
        checkAuthStatus();
        alert('Logged out');
    });
}

// Close modal on outside click
window.onclick = function (event) {
    const modal = document.getElementById('loginModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// ========================= //
// AI CHATBOT FUNCTIONS
// ========================= //

function openChatModal() {
    document.getElementById('aiChatModal').classList.add('active');
    document.body.classList.add('no-scroll');
    // Scroll to bottom of chat
    setTimeout(() => {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

function closeChatModal() {
    document.getElementById('aiChatModal').classList.remove('active');
    document.body.classList.remove('no-scroll');
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendChatMessage();
    }
}

function sendQuickMessage(message) {
    const input = document.getElementById('chatInput');
    input.value = message;
    sendChatMessage();
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    // Add user message to chat
    addUserMessage(message);

    // Clear input
    input.value = '';

    // Hide suggestions after first message
    const suggestions = document.getElementById('chatSuggestions');
    if (suggestions) {
        suggestions.style.display = 'none';
    }

    // Show typing indicator
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.style.display = 'flex';

    // Scroll to bottom
    scrollChatToBottom();

    // Simulate AI response with delay
    setTimeout(() => {
        typingIndicator.style.display = 'none';
        const aiResponse = generateAIResponse(message);
        addAIMessage(aiResponse);
        scrollChatToBottom();
    }, 1500 + Math.random() * 1000);
}

function addUserMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message user-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fa-solid fa-user"></i>
        </div>
        <div class="message-content">
            <p>${escapeHtml(message)}</p>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
}

function addAIMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message ai-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fa-solid fa-heart-pulse"></i>
        </div>
        <div class="message-content">
            ${message}
        </div>
    `;
    chatMessages.appendChild(messageDiv);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function scrollChatToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// AI Response Generator (Simulated - can be replaced with actual API)
function generateAIResponse(userMessage) {
    const msg = userMessage.toLowerCase();

    // Keywords and responses
    const responses = {
        results: `
            <p>Your assessment results show your current cardiovascular risk level based on the medical data you provided. Here's what the key indicators mean:</p>
            <ul>
                <li><strong>Blood Pressure:</strong> Indicates how hard your heart is working to pump blood</li>
                <li><strong>Cholesterol:</strong> High levels can lead to plaque buildup in arteries</li>
                <li><strong>Max Heart Rate:</strong> Shows your heart's response during physical activity</li>
            </ul>
            <p>Would you like specific advice based on your risk level?</p>
        `,

        improve: `
            <p>Great question! Here are key ways to improve your heart health:</p>
            <ul>
                <li><strong>Regular Exercise:</strong> Aim for 150 minutes of moderate aerobic activity per week</li>
                <li><strong>Heart-Healthy Diet:</strong> Focus on vegetables, fruits, whole grains, and lean proteins</li>
                <li><strong>Stress Management:</strong> Practice meditation, yoga, or deep breathing</li>
                <li><strong>Quit Smoking:</strong> If you smoke, consider cessation programs</li>
                <li><strong>Limit Alcohol:</strong> Keep intake moderate (1-2 drinks per day max)</li>
                <li><strong>Sleep Well:</strong> Aim for 7-9 hours of quality sleep</li>
            </ul>
            <p>Start with one or two changes and build from there!</p>
        `,

        diet: `
            <p>A heart-healthy diet is crucial! Here are my recommendations:</p>
            <p><strong>Foods to Include:</strong></p>
            <ul>
                <li>Leafy greens (spinach, kale)</li>
                <li>Whole grains (oats, brown rice, quinoa)</li>
                <li>Fatty fish (salmon, mackerel, sardines)</li>
                <li>Berries (blueberries, strawberries)</li>
                <li>Nuts and seeds (almonds, walnuts, chia seeds)</li>
                <li>Legumes (beans, lentils)</li>
            </ul>
            <p><strong>Foods to Limit:</strong></p>
            <ul>
                <li>Processed foods and fast food</li>
                <li>Red and processed meats</li>
                <li>Sugary drinks and desserts</li>
                <li>Excess salt and sodium</li>
                <li>Trans fats and saturated fats</li>
            </ul>
        `,

        exercise: `
            <p>Exercise is vital for heart health! Here's what I recommend:</p>
            <ul>
                <li><strong>Aerobic Exercise:</strong> Walking, jogging, cycling, swimming - 30 minutes, 5 days/week</li>
                <li><strong>Strength Training:</strong> 2-3 sessions per week with weights or resistance bands</li>
                <li><strong>Flexibility:</strong> Yoga or stretching to improve circulation</li>
                <li><strong>Start Gradually:</strong> If you're new to exercise, begin with 10-minute sessions</li>
            </ul>
            <p>Always consult your doctor before starting a new exercise program!</p>
        `,

        risk: `
            <p>Heart disease risk factors include:</p>
            <ul>
                <li><strong>Modifiable Factors:</strong> High blood pressure, high cholesterol, smoking, obesity, poor diet, lack of exercise, diabetes, excessive alcohol</li>
                <li><strong>Non-modifiable Factors:</strong> Age, family history, gender</li>
            </ul>
            <p>The good news is that many risk factors can be managed through lifestyle changes and medication when needed. Our assessment tool helps identify your current risk level.</p>
        `,

        symptoms: `
            <p><strong>⚠️ Warning Signs of Heart Problems:</strong></p>
            <ul>
                <li>Chest pain or discomfort (angina)</li>
                <li>Shortness of breath</li>
                <li>Pain in neck, jaw, or back</li>
                <li>Lightheadedness or dizziness</li>
                <li>Rapid or irregular heartbeat</li>
                <li>Swelling in legs, ankles, or feet</li>
            </ul>
            <p><strong>🚨 If you experience severe chest pain, call emergency services immediately!</strong></p>
            <p>For non-emergency symptoms, schedule an appointment with your healthcare provider.</p>
        `,

        medication: `
            <p>I can provide general information about heart medications, but please consult your doctor for specific medical advice:</p>
            <ul>
                <li><strong>Statins:</strong> Lower cholesterol</li>
                <li><strong>ACE Inhibitors:</strong> Lower blood pressure</li>
                <li><strong>Beta Blockers:</strong> Reduce heart workload</li>
                <li><strong>Blood Thinners:</strong> Prevent clots</li>
            </ul>
            <p>Never start or stop medication without consulting your healthcare provider!</p>
        `,

        default: `
            <p>I'm here to help with heart health questions! I can provide information about:</p>
            <ul>
                <li>Understanding your assessment results</li>
                <li>Heart-healthy diet and nutrition</li>
                <li>Exercise recommendations</li>
                <li>Risk factors and prevention</li>
                <li>General cardiovascular health</li>
            </ul>
            <p>What would you like to know more about?</p>
        `
    };

    // Match user message to response
    if (msg.includes('result') || msg.includes('assessment') || msg.includes('score')) {
        return responses.results;
    } else if (msg.includes('improve') || msg.includes('better') || msg.includes('health')) {
        return responses.improve;
    } else if (msg.includes('diet') || msg.includes('food') || msg.includes('eat') || msg.includes('nutrition')) {
        return responses.diet;
    } else if (msg.includes('exercise') || msg.includes('workout') || msg.includes('physical') || msg.includes('activity')) {
        return responses.exercise;
    } else if (msg.includes('risk') || msg.includes('factor') || msg.includes('chance')) {
        return responses.risk;
    } else if (msg.includes('symptom') || msg.includes('sign') || msg.includes('pain') || msg.includes('warning')) {
        return responses.symptoms;
    } else if (msg.includes('medication') || msg.includes('medicine') || msg.includes('drug') || msg.includes('pill')) {
        return responses.medication;
    } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
        return `<p>Hello! I'm Dr. HeartGuard AI, your virtual cardiac health assistant. How can I help you today?</p>`;
    } else if (msg.includes('thank')) {
        return `<p>You're welcome! Feel free to ask if you have any more questions about heart health. Take care! ❤️</p>`;
    } else {
        return responses.default;
    }
}

// Close chat modal on outside click
window.addEventListener('click', function (event) {
    const chatModal = document.getElementById('aiChatModal');
    if (event.target === chatModal) {
        closeChatModal();
    }
});