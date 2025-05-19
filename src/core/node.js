const GRID_SIZE = 20;

export class Node {
  constructor(canvas, x, y, label = 'Node') {
    this.canvas = canvas;
    this.x = Math.round(x / GRID_SIZE) * GRID_SIZE;
    this.y = Math.round(y / GRID_SIZE) * GRID_SIZE;
    this.width = 100;
    this.height = 40;
    this.label = label;
    this.id = generateId('node');

    this.rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    this.text = document.createElementNS("http://www.w3.org/2000/svg", "text");

    this.rect.setAttribute("x", this.x);
    this.rect.setAttribute("y", this.y);
    this.rect.setAttribute("width", this.width);
    this.rect.setAttribute("height", this.height);
    this.rect.setAttribute("fill", "#fff");
    this.rect.setAttribute("stroke", "#333");
    this.rect.setAttribute("rx", "5");
    this.rect.setAttribute("ry", "5");

    this.text.setAttribute("x", this.x + 10);
    this.text.setAttribute("y", this.y + 25);
    this.text.textContent = label;

    this.isDragging = false;
    this.offsetX = 0;
    this.offsetY = 0;

    this.initDrag();

    canvas.addNode(this);
  }

  initDrag() {
    this.rect.addEventListener('mousedown', e => {
      this.isDragging = true;
      this.offsetX = e.clientX - parseFloat(this.rect.getAttribute('x'));
      this.offsetY = e.clientY - parseFloat(this.rect.getAttribute('y'));
      document.body.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', e => {
      if (this.isDragging) {
        let newX = e.clientX - this.offsetX;
        let newY = e.clientY - this.offsetY;

        newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
        newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;

        this.rect.setAttribute("x", newX);
        this.rect.setAttribute("y", newY);
        this.text.setAttribute("x", newX + 10);
        this.text.setAttribute("y", newY + 25);
        this.x = newX;
        this.y = newY;
        if (this.onMoveCallback) this.onMoveCallback();
      }
    });

    document.addEventListener('mouseup', () => {
      this.isDragging = false;
      document.body.style.cursor = 'default';
    });
  }

  onMove(callback) {
    this.onMoveCallback = callback;
  }

  setSelected(selected) {
    this.isSelected = selected;
    this.rect.setAttribute("stroke", selected ? "#0096ff" : "#333");
    this.rect.setAttribute("stroke-width", selected ? "3" : "1");
  }
}