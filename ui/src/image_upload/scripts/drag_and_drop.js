export function initializeDragAndDrop(container, onFileSelected) {
    // Handle drag and drop
    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        container.style.border = '2px dashed var(--neon-color)';
    });

    container.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        container.style.border = 'none';
    });

    container.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        container.style.border = 'none';
        
        const file = e.dataTransfer.files[0];
        if (file) {
            onFileSelected(file);
        }
    });
} 