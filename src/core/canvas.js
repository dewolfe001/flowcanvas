import { Node } from './node.js';
import { Connector } from './connector.js';

export class Canvas {
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