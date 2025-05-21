import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const currentDir = path.dirname(fileURLToPath(import.meta.url));

// Serve a simple test page
router.get('/test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Shelly Smart Home Test</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            h1 {
                color: #333;
                border-bottom: 1px solid #eee;
                padding-bottom: 10px;
            }
            .card {
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
                background-color: #f9f9f9;
            }
            .button {
                display: inline-block;
                background-color: #4CAF50;
                color: white;
                padding: 10px 15px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                margin-right: 10px;
            }
            .button:hover {
                background-color: #45a049;
            }
            pre {
                background-color: #f5f5f5;
                padding: 10px;
                border-radius: 4px;
                overflow-x: auto;
            }
        </style>
    </head>
    <body>
        <h1>Shelly Smart Home Test Page</h1>
        <p>Server running on port 8080</p>
        
        <div class="card">
            <h2>API Status</h2>
            <p>Testing connection to the Shelly Smart Home API...</p>
            <button id="testApi" class="button">Test API</button>
            <pre id="apiResult">Click the button to test the API...</pre>
        </div>
        
        <div class="card">
            <h2>Device Control</h2>
            <p>Control your Shelly devices:</p>
            <div id="deviceControls">Loading devices...</div>
        </div>
        
        <div class="card">
            <h2>Electricity Prices</h2>
            <p>Current electricity prices from elprisetjustnu.se:</p>
            <div style="margin-bottom: 15px;">
                <label for="priceDate">Date (MM-DD format):</label>
                <input type="text" id="priceDate" placeholder="05-19" style="padding: 8px; margin-right: 10px;">
                <button id="fetchPrices" class="button">Fetch Prices</button>
            </div>
            <div id="priceChart" style="height: 300px; margin-top: 20px;"></div>
            <pre id="priceData" style="margin-top: 20px;">Click the button to fetch electricity prices...</pre>
        </div>
        
        <script>
            // Add Chart.js for electricity price visualization
            const chartScript = document.createElement('script');
            chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            document.head.appendChild(chartScript);
            
            // Test API connection
            document.getElementById('testApi').addEventListener('click', async () => {
                const resultElement = document.getElementById('apiResult');
                resultElement.textContent = 'Fetching data...';
                
                try {
                    const response = await fetch('/api/devices');
                    const data = await response.json();
                    resultElement.textContent = JSON.stringify(data, null, 2);
                    
                    // Also update device controls
                    updateDeviceControls(data);
                } catch (error) {
                    resultElement.textContent = 'Error: ' + error.message;
                }
            });
            
            // Fetch electricity prices
            document.getElementById('fetchPrices').addEventListener('click', async function() {
                const priceDataElement = document.getElementById('priceData');
                priceDataElement.textContent = 'Fetching electricity prices...';
                
                // Get the date from the input field
                const dateInput = document.getElementById('priceDate');
                const date = dateInput.value.trim();
                
                try {
                    // Use the date if provided, otherwise use the current date
                    const url = date ? '/api/electricity-prices?date=' + date : '/api/electricity-prices';
                    const response = await fetch(url);
                    
                    if (!response.ok) {
                        throw new Error('Error ' + response.status + ': ' + response.statusText);
                    }
                    
                    const data = await response.json();
                    priceDataElement.textContent = JSON.stringify(data, null, 2);
                    
                    // Create a chart with the price data
                    createPriceChart(data);
                } catch (error) {
                    priceDataElement.textContent = 'Error: ' + error.message;
                }
            });
            
            // Set today's date as default in the date input field
            window.addEventListener('DOMContentLoaded', function() {
                const today = new Date();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                document.getElementById('priceDate').value = month + '-' + day;
            });
            
            // Create a chart for electricity prices
            function createPriceChart(priceData) {
                if (!priceData || !priceData.length) {
                    return;
                }
                
                // Format the data for Chart.js
                const labels = priceData.map(item => {
                    const date = new Date(item.time_start);
                    return date.getHours() + ':00';
                });
                
                const prices = priceData.map(item => item.SEK_per_kWh);
                
                // Clear previous chart if it exists
                const chartContainer = document.getElementById('priceChart');
                chartContainer.innerHTML = '<canvas id="priceCanvas"></canvas>';
                
                // Wait for Chart.js to load
                setTimeout(() => {
                    if (window.Chart) {
                        const ctx = document.getElementById('priceCanvas').getContext('2d');
                        new Chart(ctx, {
                            type: 'line',
                            data: {
                                labels: labels,
                                datasets: [{
                                    label: 'Price (SEK/kWh)',
                                    data: prices,
                                    borderColor: 'rgb(75, 192, 192)',
                                    tension: 0.1,
                                    fill: false
                                }]
                            },
                            options: {
                                responsive: true,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        title: {
                                            display: true,
                                            text: 'SEK per kWh'
                                        }
                                    },
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Hour of Day'
                                        }
                                    }
                                }
                            }
                        });
                    } else {
                        console.error('Chart.js not loaded');
                    }
                }, 500);
            }
            
            // Load devices on page load
            window.addEventListener('DOMContentLoaded', async () => {
                try {
                    const response = await fetch('/api/devices');
                    const devices = await response.json();
                    updateDeviceControls(devices);
                } catch (error) {
                    document.getElementById('deviceControls').textContent = 'Error loading devices: ' + error.message;
                }
            });
            
            // Update device controls
            function updateDeviceControls(devices) {
                const controlsElement = document.getElementById('deviceControls');
                
                if (!devices || devices.length === 0) {
                    controlsElement.textContent = 'No devices found.';
                    return;
                }
                
                let html = '';
                devices.forEach(device => {
                    html += \`
                        <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                            <strong>\${device.name}</strong> (\${device.type})
                            <div>Status: <span style="color: \${device.status === 'online' ? 'green' : 'red'}">\${device.status}</span></div>
                            <div>Power: \${device.power}</div>
                            <div>State: \${device.isOn ? 'ON' : 'OFF'}</div>
                            <button 
                                onclick="controlDevice(\${device.id}, '\${device.isOn ? 'turn_off' : 'turn_on'}')" 
                                class="button" 
                                style="margin-top: 10px; background-color: \${device.isOn ? '#f44336' : '#4CAF50'}"
                            >
                                \${device.isOn ? 'Turn OFF' : 'Turn ON'}
                            </button>
                        </div>
                    \`;
                });
                
                controlsElement.innerHTML = html;
            }
            
            // Control device
            async function controlDevice(id, action) {
                try {
                    const response = await fetch(\`/api/devices/\${id}/control\`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ action })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        // Refresh device list
                        const devicesResponse = await fetch('/api/devices');
                        const devices = await devicesResponse.json();
                        updateDeviceControls(devices);
                    } else {
                        alert('Error: ' + (result.message || 'Unknown error'));
                    }
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            }
        </script>
    </body>
    </html>
  `);
});

export default router;
