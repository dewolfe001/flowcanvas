(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.FlowCanvas = {}));
})(this, (function (exports) { 'use strict';

  const GRID_SIZE = 20;

  class Node {
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

  class Connector {
    constructor(canvas, source, target) {
      this.source = source;
      this.target = target;

      this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      this.path.setAttribute("class", "connector");

      canvas.addConnector(this);
      this.update();
    }

    update() {
      const x1 = this.source.x + this.source.width / 2;
      const y1 = this.source.y + this.source.height / 2;
      const x2 = this.target.x + this.target.width / 2;
      const y2 = this.target.y + this.target.height / 2;

      const dx = (x2 - x1) * 0.5;
      const dy = 0;
      const xcp1 = x1 + dx;
      const ycp1 = y1 + dy;
      const xcp2 = x2 - dx;
      const ycp2 = y2 + dy;

      const d = `M ${x1} ${y1} C ${xcp1} ${ycp1}, ${xcp2} ${ycp2}, ${x2} ${y2}`;
      this.path.setAttribute("d", d);
    }
  }

  class Canvas {
    constructor(svgElement) {
      this.svg = svgElement;
      this.nodes = [];
      this.connectors = [];
      this.history = [];
      this.currentStateIndex = -1;
    }

    addNode(node) {
      this.nodes.push(node);
      this.svg.appendChild(node.rect);
      this.svg.appendChild(node.text);
    }

    addConnector(connector) {
      this.connectors.push(connector);
      this.svg.appendChild(connector.path);
    }

    updateConnectorsFor(movedNode) {
      this.connectors.forEach(connector => {
        if (connector.source === movedNode || connector.target === movedNode) {
          connector.update();
        }
      });
    }

    exportDiagram() {
      return {
        nodes: this.nodes.map(node => ({
          id: node.id,
          x: node.x,
          y: node.y,
          label: node.label,
          width: node.width,
          height: node.height
        })),
        connectors: this.connectors.map(connector => ({
          source: connector.source.id,
          target: connector.target.id
        }))
      };
    }

    importDiagram(data) {
      // Clear existing
      this.nodes.forEach(node => {
        node.rect.remove();
        node.text.remove();
      });
      this.connectors.forEach(connector => connector.path.remove());
      this.nodes = [];
      this.connectors = [];

      const nodeMap = {};

      data.nodes.forEach(n => {
        const node = new Node(this, n.x, n.y, n.label);
        node.id = n.id;
        nodeMap[n.id] = node;
      });

      data.connectors.forEach(c => {
        const source = nodeMap[c.source];
        const target = nodeMap[c.target];
        if (source && target) {
          new Connector(this, source, target);
        }
      });
    }

    takeSnapshot() {
      this.currentStateIndex++;
      this.history[this.currentStateIndex] = JSON.stringify(this.exportDiagram());
      this.history = this.history.slice(0, this.currentStateIndex + 1);
    }

    undo() {
      if (this.currentStateIndex > 0) {
        this.currentStateIndex--;
        this.importDiagram(JSON.parse(this.history[this.currentStateIndex]));
      }
    }

    redo() {
      if (this.currentStateIndex < this.history.length - 1) {
        this.currentStateIndex++;
        this.importDiagram(JSON.parse(this.history[this.currentStateIndex]));
      }
    }
  }

  let counters = {};

  function generateId$1(prefix = 'id') {
    if (!counters[prefix]) counters[prefix] = 1;
    return `${prefix}${counters[prefix]++}`;
  }

  exports.Canvas = Canvas;
  exports.Connector = Connector;
  exports.Node = Node;
  exports.generateId = generateId$1;

}));
