import { AppState } from "../../scripts/app_state.js";

export class FrameSelector {
  constructor(imageElement) {
    this.imageElement = imageElement;
    this.container = null;
    this.corners = [];
    this.lines = [];
    this.activeDragCorner = null;
    this.init();
  }

  init() {
    // Create container
    this.container = document.createElement("div");
    this.container.className = "frame-selector";

    // Position container over the image
    this.updateContainerPosition();

    // Add container to the image's parent
    this.imageElement.parentElement.appendChild(this.container);

    // Create corners and lines
    this.createCorners();
    this.createLines();
    this.initializeCornerPositions();

    // Update on window resize with debounce
    let resizeTimeout;
    window.addEventListener("resize", () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(() => {
        this.updateContainerPosition();
        this.updateCornerPositions();
      }, 100);
    });
  }

  updateContainerPosition() {
    const imageRect = this.imageElement.getBoundingClientRect();
    const { rotation } = AppState.getTransformations() || { rotation: 0 };
    const isSwapped = rotation % 180 !== 0;
    
    // Update container dimensions based on rotation
    if (isSwapped) {
      this.container.style.width = `${imageRect.height}px`;
      this.container.style.height = `${imageRect.width}px`;
    } else {
      this.container.style.width = `${imageRect.width}px`;
      this.container.style.height = `${imageRect.height}px`;
    }
    
    this.container.style.position = "absolute";
    this.container.style.top = "50%";
    this.container.style.left = "50%";
    this.container.style.transform = this.imageElement.style.transform;
  }

  updateCornerPositions() {
    const imageRect = this.imageElement.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    this.corners.forEach(corner => {
      const left = parseFloat(corner.style.left) || 0;
      const top = parseFloat(corner.style.top) || 0;
      
      // Convert current positions to percentages
      const percentX = left / parseFloat(this.container.style.width);
      const percentY = top / parseFloat(this.container.style.height);
      
      // Apply new positions
      corner.style.left = `${percentX * containerRect.width}px`;
      corner.style.top = `${percentY * containerRect.height}px`;
    });
    
    this.updateLines();
    this.updateAppState();
  }

  createCorners() {
    for (let i = 0; i < 4; i++) {
      const corner = document.createElement("div");
      corner.className = "frame-corner";
      corner.dataset.index = i;
      
      // Set initial position to prevent NaN values
      corner.style.left = "0px";
      corner.style.top = "0px";
      
      corner.addEventListener("mousedown", (e) => this.startDragging(e, corner));
      this.corners.push(corner);
      this.container.appendChild(corner);
    }

    document.addEventListener("mousemove", this.handleDrag.bind(this));
    document.addEventListener("mouseup", this.stopDragging.bind(this));
  }

  createLines() {
    for (let i = 0; i < 4; i++) {
      const line = document.createElement("div");
      line.className = "frame-line";
      line.style.height = "2px"; // Set a default line thickness
      this.lines.push(line);
      this.container.appendChild(line);
    }
  }

  initializeCornerPositions() {
    const rect = this.container.getBoundingClientRect();
    const padding = Math.min(rect.width, rect.height) * 0.15;

    const positions = [
      { x: padding, y: padding }, // Top-left
      { x: rect.width - padding, y: padding }, // Top-right
      { x: rect.width - padding, y: rect.height - padding }, // Bottom-right
      { x: padding, y: rect.height - padding }, // Bottom-left
    ];

    positions.forEach((pos, i) => {
      const corner = this.corners[i];
      corner.style.left = `${pos.x}px`;
      corner.style.top = `${pos.y}px`;
    });

    this.updateLines();
    this.updateAppState();
  }

  startDragging(e, corner) {
    e.preventDefault();
    this.activeDragCorner = corner;
    corner.classList.add("dragging");
    this.container.classList.add("dragging");
  }

  handleDrag(e) {
    if (!this.activeDragCorner) return;

    const rect = this.container.getBoundingClientRect();
    
    // Calculate position relative to the container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Clamp to container bounds
    const clampedX = Math.max(0, Math.min(rect.width, x));
    const clampedY = Math.max(0, Math.min(rect.height, y));

    this.activeDragCorner.style.left = `${clampedX}px`;
    this.activeDragCorner.style.top = `${clampedY}px`;

    this.updateLines();
    this.updateAppState();
  }

  stopDragging() {
    if (!this.activeDragCorner) return;
    this.activeDragCorner.classList.remove("dragging");
    this.container.classList.remove("dragging");
    this.activeDragCorner = null;
  }

  updateLines() {
    this.corners.forEach((corner, i) => {
      const nextCorner = this.corners[(i + 1) % 4];
      const line = this.lines[i];

      const x1 = parseFloat(corner.style.left);
      const y1 = parseFloat(corner.style.top);
      const x2 = parseFloat(nextCorner.style.left);
      const y2 = parseFloat(nextCorner.style.top);

      const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      const angle = Math.atan2(y2 - y1, x2 - x1);

      line.style.width = `${length}px`;
      line.style.left = `${x1}px`;
      line.style.top = `${y1}px`;
      line.style.transform = `rotate(${angle}rad)`;
      line.style.transformOrigin = "left center";
    });
  }

  updateAppState() {
    const scaleX = this.imageElement.naturalWidth / this.container.offsetWidth;
    const scaleY = this.imageElement.naturalHeight / this.container.offsetHeight;

    const imageCoordinates = this.corners.map((corner) => ({
      x: parseFloat(corner.style.left) * scaleX,
      y: parseFloat(corner.style.top) * scaleY,
    }));

    // Update AppState with the new coordinates
    AppState.setCornerCoordinates(imageCoordinates);
  }

  setCornerPositions(coordinates) {
    if (!coordinates || coordinates.length !== 4) return;
    
    const scaleX = this.container.offsetWidth / this.imageElement.naturalWidth;
    const scaleY = this.container.offsetHeight / this.imageElement.naturalHeight;

    coordinates.forEach((coord, i) => {
      const corner = this.corners[i];
      corner.style.left = `${coord.x * scaleX}px`;
      corner.style.top = `${coord.y * scaleY}px`;
    });

    this.updateLines();
  }

  show() {
    this.container.style.display = "block";
  }

  hide() {
    this.container.style.display = "none";
  }
}
