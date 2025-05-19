import React, { useEffect, useRef } from 'react';
import { Canvas, Node, Connector } from '../../src/index.js';

const FlowCanvas = () => {
  const svgRef = useRef(null);

  useEffect(() => {
    const diagram = new Canvas(svgRef.current);

    const node1 = new Node(diagram, 100, 100, 'Start');
    const node2 = new Node(diagram, 300, 200, 'End');

    new Connector(diagram, node1, node2);

    window.canvas = diagram; // For debugging
  }, []);

  return (
    <div style={{ width: '100%', height: '80vh' }}>
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
};

export default FlowCanvas;