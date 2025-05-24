import { appState } from "./state.js";

export class FrameSelector {
  constructor(imageElement) {
    this.imageElement = imageElement;
    this.container = null;
    this.corners = [];
    this.lines = [];
    this.guides = {
      horizontal: null,
      vertical: null
    };
    this.activeDragCorner = null;
    this.snapThreshold = 10;
    this.init();
  }

  init() {
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'frame-selector';
    
    // Position container over the image
    const rect = this.imageElement.getBoundingClientRect();
    this.container.style.width = `${rect.width}px`;
    this.container.style.height = `${rect.height}px`;
    this.container.style.position = 'absolute';
    this.container.style.top = `${this.imageElement.offsetTop}px`;
    this.container.style.left = `${this.imageElement.offsetLeft}px`;
    
    this.imageElement.parentElement.appendChild(this.container);

    // Create guides
    this.guides.horizontal = document.createElement('div');
    this.guides.horizontal.className = 'frame-guide horizontal';
    this.container.appendChild(this.guides.horizontal);

    this.guides.vertical = document.createElement('div');
    this.guides.vertical.className = 'frame-guide vertical';
    this.container.appendChild(this.guides.vertical);

    // Create corners and lines
    this.createCorners();
    this.createLines();
    this.initializeCornerPositions();

    // Update on window resize
    window.addEventListener('resize', () => {
      const newRect = this.imageElement.getBoundingClientRect();
      this.container.style.width = `${newRect.width}px`;
      this.container.style.height = `${newRect.height}px`;
      this.container.style.top = `${this.imageElement.offsetTop}px`;
      this.container.style.left = `${this.imageElement.offsetLeft}px`;
      this.initializeCornerPositions();
    });
  }

  createCorners() {
    for (let i = 0; i < 4; i++) {
      const corner = document.createElement('div');
      corner.className = 'frame-corner';
      corner.dataset.index = i;
      corner.addEventListener('mousedown', (e) => this.startDragging(e, corner));
      this.corners.push(corner);
      this.container.appendChild(corner);
    }

    document.addEventListener('mousemove', this.handleDrag.bind(this));
    document.addEventListener('mouseup', this.stopDragging.bind(this));
  }

  createLines() {
    for (let i = 0; i < 4; i++) {
      const line = document.createElement('div');
      line.className = 'frame-line';
      this.lines.push(line);
      this.container.appendChild(line);
    }
  }

  initializeCornerPositions() {
    const rect = this.container.getBoundingClientRect();
    const padding = Math.min(rect.width, rect.height) * 0.15;
    
    const positions = [
      { x: padding, y: padding },
      { x: rect.width - padding, y: padding },
      { x: rect.width - padding, y: rect.height - padding },
      { x: padding, y: rect.height - padding }
    ];

    positions.forEach((pos, i) => {
      this.corners[i].style.left = `${pos.x}px`;
      this.corners[i].style.top = `${pos.y}px`;
    });

    this.updateLines();
  }

  startDragging(e, corner) {
    e.preventDefault();
    this.activeDragCorner = corner;
    corner.classList.add('dragging');
  }

  handleDrag(e) {
    if (!this.activeDragCorner) return;

    const rect = this.container.getBoundingClientRect();
    const cornerSize = 20;
    const halfCornerSize = cornerSize / 2;

    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    x = Math.max(halfCornerSize, Math.min(rect.width - halfCornerSize, x));
    y = Math.max(halfCornerSize, Math.min(rect.height - halfCornerSize, y));

    // Check for snapping
    const corners = this.corners.filter(c => c !== this.activeDragCorner);
    corners.forEach(corner => {
      const cornerLeft = parseFloat(corner.style.left);
      const cornerTop = parseFloat(corner.style.top);

      if (Math.abs(x - cornerLeft) < this.snapThreshold) {
        x = cornerLeft;
        this.guides.vertical.classList.add('active');
        this.guides.vertical.style.left = `${x}px`;
      }

      if (Math.abs(y - cornerTop) < this.snapThreshold) {
        y = cornerTop;
        this.guides.horizontal.classList.add('active');
        this.guides.horizontal.style.top = `${y}px`;
      }
    });

    this.activeDragCorner.style.left = `${x}px`;
    this.activeDragCorner.style.top = `${y}px`;

    this.updateLines();
    this.updateAppState();
  }

  stopDragging() {
    if (!this.activeDragCorner) return;
    this.activeDragCorner.classList.remove('dragging');
    this.activeDragCorner = null;
    this.guides.horizontal.classList.remove('active');
    this.guides.vertical.classList.remove('active');
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

      line.style.left = `${x1}px`;
      line.style.top = `${y1}px`;
      line.style.width = `${length}px`;
      line.style.transform = `rotate(${angle}rad)`;
    });
  }

  updateAppState() {
    const scaleX = this.imageElement.naturalWidth / this.container.offsetWidth;
    const scaleY = this.imageElement.naturalHeight / this.container.offsetHeight;

    const imageCoordinates = this.corners.map(corner => ({
      x: parseFloat(corner.style.left) * scaleX,
      y: parseFloat(corner.style.top) * scaleY
    }));

    appState.coordinates = imageCoordinates;
  }

  show() {
    this.container.style.display = 'block';
  }

  hide() {
    this.container.style.display = 'none';
  }
} 