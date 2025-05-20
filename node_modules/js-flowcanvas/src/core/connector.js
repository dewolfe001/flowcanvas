export class Connector {
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