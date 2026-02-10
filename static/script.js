/**
 * Heart Disease Risk Assessment System
 * Modified JavaScript - Shows Risk Percentage, Precautions & Diet Plan
 */

// ==================== TAB SWITCHING ====================

function switchTab(event, tabName) {
    event.preventDefault();
    
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// ==================== FORM SUBMISSION ====================

function makePrediction(event) {
    event.preventDefault();

    // Collect all 13 form values
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

    // Validate form
    if (!validateForm(formData)) {
        showErrorMessage('❌ Please fill all fields correctly');
        return;
    }

    // Show loading animation
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';

    // Send prediction request
    fetch('/api/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('loading').style.display = 'none';
        displayResults(data);
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('loading').style.display = 'none';
        showErrorMessage('❌ Error: ' + error.message);
    });
}

// ==================== FORM VALIDATION ====================

function validateForm(formData) {
    const requiredFields = [
        'age', 'sex', 'chest_pain_type', 'resting_blood_pressure',
        'cholesterol', 'fasting_blood_sugar', 'resting_ecg',
        'max_heart_rate', 'exercise_induced_angina', 'st_depression',
        'st_slope', 'major_vessels', 'thalassemia'
    ];

    for (let field of requiredFields) {
        if (formData[field] === null || formData[field] === undefined || formData[field] === '') {
            return false;
        }
    }
    return true;
}

// ==================== DISPLAY RESULTS ====================

function displayResults(data) {
    // Determine color based on risk level
    let riskColor = 'low';
    if (data.risk_percentage >= 67) {
        riskColor = 'high';
    } else if (data.risk_percentage >= 34) {
        riskColor = 'moderate';
    }

    // Create risk percentage display
    let riskHTML = `
        <div class="risk-diagnosis">${data.diagnosis}</div>
        <div class="risk-percentage ${riskColor}">${data.risk_percentage}%</div>
        <div class="risk-message">${data.message}</div>
    `;

    document.getElementById('riskContainer').innerHTML = riskHTML;

    // Display precautions
    let precautionsHTML = `
        <h3>${data.precautions.title}</h3>
        <ul>
    `;

    data.precautions.precautions.forEach(precaution => {
        precautionsHTML += `<li>${precaution}</li>`;
    });

    precautionsHTML += `</ul>`;
    document.getElementById('precautionsContainer').innerHTML = precautionsHTML;

    // Display diet plan
    let dietHTML = `
        <h3>${data.diet_plan.title}</h3>
        <div style="margin-top: 15px;">
            <h4 style="color: #27ae60; margin-top: 15px;">✓ Foods to Eat:</h4>
            <ul>
    `;

    data.diet_plan.foods_to_eat.forEach(food => {
        dietHTML += `<li>${food}</li>`;
    });

    dietHTML += `
            </ul>
            <h4 style="color: #e74c3c; margin-top: 15px;">✗ Foods to Avoid:</h4>
            <ul>
    `;

    data.diet_plan.foods_to_avoid.forEach(food => {
        dietHTML += `<li>${food}</li>`;
    });

    dietHTML += `
            </ul>
        </div>
    `;

    document.getElementById('dietContainer').innerHTML = dietHTML;

    // Display timestamp
    const timestamp = new Date(data.timestamp).toLocaleString();
    document.getElementById('timestamp').innerHTML = `<strong>Assessment Time:</strong> ${timestamp}`;

    // Show results
    document.getElementById('results').style.display = 'block';
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ==================== ERROR HANDLING ====================

function showErrorMessage(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.innerHTML = message;
    errorDiv.style.display = 'block';
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ==================== CLEAR RESULTS ====================

function clearResults() {
    // Reset form
    document.querySelector('form').reset();
    
    // Hide results
    document.getElementById('results').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('loading').style.display = 'none';
}

// ==================== HISTORY FUNCTIONS ====================

function loadHistory() {
    fetch('/api/history')
    .then(response => response.json())
    .then(data => {
        const historyContainer = document.getElementById('historyContainer');
        
        if (!data.history || data.history.length === 0) {
            historyContainer.innerHTML = '<p style="color: #95a5a6;">No history found</p>';
            return;
        }

        let html = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e74c3c; color: white;">
                        <th style="padding: 10px; text-align: left;">Date & Time</th>
                        <th style="padding: 10px; text-align: right;">Age</th>
                        <th style="padding: 10px; text-align: right;">BP (mmHg)</th>
                        <th style="padding: 10px; text-align: right;">Cholesterol</th>
                        <th style="padding: 10px; text-align: right;">Risk %</th>
                        <th style="padding: 10px; text-align: left;">Risk Level</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.history.forEach(record => {
            const date = new Date(record.created_at).toLocaleString();
            html += `
                <tr style="border-bottom: 1px solid #ecf0f1;">
                    <td style="padding: 10px;">${date}</td>
                    <td style="padding: 10px; text-align: right;">${record.age}</td>
                    <td style="padding: 10px; text-align: right;">${record.resting_blood_pressure}</td>
                    <td style="padding: 10px; text-align: right;">${record.cholesterol}</td>
                    <td style="padding: 10px; text-align: right; font-weight: 600; color: #e74c3c;">${record.risk_percentage.toFixed(1)}%</td>
                    <td style="padding: 10px;">${record.risk_level.replace(/_/g, ' ')}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        historyContainer.innerHTML = html;
    })
    .catch(error => {
        console.error('Error loading history:', error);
        document.getElementById('historyContainer').innerHTML = '<p style="color: red;">Error loading history</p>';
    });
}

function clearDatabase() {
    if (confirm('Are you sure you want to delete all assessment history? This action cannot be undone.')) {
        fetch('/api/clear-history', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            alert('✓ History cleared successfully');
            document.getElementById('historyContainer').innerHTML = '';
            loadHistory();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error clearing history');
        });
    }
}

// ==================== EVENT LISTENERS ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('❤️ Heart Disease Risk Assessment System Loaded');
    console.log('✓ Ready to assess your heart health');
});

// Allow form submission with Enter key
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && event.target.form) {
        event.target.form.dispatchEvent(new Event('submit'));
    }
});