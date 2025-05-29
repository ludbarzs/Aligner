import { AppState } from "../../scripts/app_state.js";

export class FrameSelector {
  constructor(imageElement) {
    this.imageElement = imageElement;
    this.container = null;
    this.corners = [];
    this.lines = [];
    this.activeDragCorner = null;
    this.cornerPositions = []; // Store positions as percentages
    this.init();
  }

  init() {
    // Create container
    this.container = document.createElement("div");
    this.container.className = "frame-selector";

    // Position container over the image
    const imageRect = this.imageElement.getBoundingClientRect();
    this.container.style.width = `${imageRect.width}px`;
    this.container.style.height = `${imageRect.height}px`;
    this.container.style.position = "absolute";
    this.container.style.top = "50%";
    this.container.style.left = "50%";
    this.container.style.transform = "translate(-50%, -50%)";

    // Add container to the image's parent
    this.imageElement.parentElement.appendChild(this.container);

    // Initialize cornerPositions with default percentage values
    this.cornerPositions = [
      { x: 15, y: 15 },        // Top-left
      { x: 85, y: 15 },        // Top-right
      { x: 85, y: 85 },        // Bottom-right
      { x: 15, y: 85 }         // Bottom-left
    ];

    // Create corners and lines
    this.createCorners();
    this.createLines();
    this.initializeCornerPositions();

    // Update on window resize
    window.addEventListener("resize", () => {
      this.updateContainerSize();
      this.updateCornersFromPercentages();
      this.updateLines();
      this.updateAppState();
    });
  }

  updateContainerSize() {
    const imageRect = this.imageElement.getBoundingClientRect();
    this.container.style.width = `${imageRect.width}px`;
    this.container.style.height = `${imageRect.height}px`;
  }

  updateCornersFromPercentages() {
    const rect = this.container.getBoundingClientRect();
    this.corners.forEach((corner, i) => {
      const pos = this.cornerPositions[i];
      corner.style.left = `${(pos.x * rect.width) / 100}px`;
      corner.style.top = `${(pos.y * rect.height) / 100}px`;
    });
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
    this.updateContainerSize();
    this.updateCornersFromPercentages();
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

    // Clamp to container bounds and convert to percentages
    const clampedX = Math.max(0, Math.min(rect.width, x));
    const clampedY = Math.max(0, Math.min(rect.height, y));
    
    const percentX = (clampedX / rect.width) * 100;
    const percentY = (clampedY / rect.height) * 100;

    // Update both the visual position and stored percentage
    this.activeDragCorner.style.left = `${clampedX}px`;
    this.activeDragCorner.style.top = `${clampedY}px`;
    
    const cornerIndex = parseInt(this.activeDragCorner.dataset.index);
    this.cornerPositions[cornerIndex] = { x: percentX, y: percentY };

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
    const rect = this.container.getBoundingClientRect();
    
    const imageCoordinates = this.cornerPositions.map(pos => ({
      x: (pos.x / 100) * this.imageElement.naturalWidth,
      y: (pos.y / 100) * this.imageElement.naturalHeight,
    }));

    AppState.setCornerCoordinates(imageCoordinates);
  }

  setCornerPositions(coordinates) {
    if (!coordinates || coordinates.length !== 4) return;
    
    const rect = this.container.getBoundingClientRect();
    
    // Convert absolute coordinates to percentages and update both stored and visual positions
    coordinates.forEach((coord, i) => {
      const percentX = (coord.x / this.imageElement.naturalWidth) * 100;
      const percentY = (coord.y / this.imageElement.naturalHeight) * 100;
      
      this.cornerPositions[i] = { x: percentX, y: percentY };
      
      const corner = this.corners[i];
      corner.style.left = `${(percentX * rect.width) / 100}px`;
      corner.style.top = `${(percentY * rect.height) / 100}px`;
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
