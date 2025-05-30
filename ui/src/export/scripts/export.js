import { AppState } from "../../scripts/app_state.js";

// Function to download the DXF file
function downloadDxf() {
    const dxfData = AppState.getDxfData();
    
    if (!dxfData) {
        alert('No DXF data available. Please process an image first.');
        return;
    }

    // Create a Blob from the base64 DXF data
    const binaryData = atob(dxfData);
    const blob = new Blob([binaryData], { type: 'application/dxf' });
    
    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported.dxf';
    
    // Trigger the download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Add click event listener to the export button
document.getElementById('export-button').addEventListener('click', downloadDxf);

// Check if we have processed data
if (!AppState.getDxfData()) {
    alert('No processed data found. Redirecting to upload page...');
    window.location.href = '../image_upload/image_upload.html';
} 