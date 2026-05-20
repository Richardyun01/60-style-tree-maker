import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import AircraftNode from './AircraftNode';
import './App.css';

const nodeTypes = {
  aircraft: AircraftNode,
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Form state
  const [nodeName, setNodeName] = useState('');
  const [nodePhoto, setNodePhoto] = useState('');
  const [isActive, setIsActive] = useState(false);
  
  // Selected node tracking
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Panel open/close state
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'step' }, eds)),
    [setEdges],
  );

  // Use React Flow built-in selection event
  const onSelectionChange = useCallback(({ nodes }) => {
    const selectedNode = nodes.find(n => n.selected);
    if (selectedNode) {
      // On node selection: fill form with node info
      setSelectedNodeId(selectedNode.id);
      setNodeName(selectedNode.data.label || '');
      setNodePhoto(selectedNode.data.photo || '');
      setIsActive(selectedNode.data.isActive || false);
    } else {
      // On deselection (background click): reset form and switch to add mode
      setSelectedNodeId(null);
      setNodeName('');
      setNodePhoto('');
      setIsActive(false);
    }
  }, []);

  const onSubmit = () => {
    if (!nodeName.trim()) return alert('Please enter a name.');

    if (selectedNodeId) {
      // If node is selected, update
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedNodeId
            ? { ...n, data: { ...n.data, label: nodeName, photo: nodePhoto, isActive } }
            : n
        )
      );
    } else {
      // Translated/Removed non-ASCII comment
      const newNode = {
        id: Date.now().toString(),
        type: 'aircraft',
        position: { x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 100 },
        data: { label: nodeName, photo: nodePhoto, isActive }
      };
      setNodes((nds) => nds.concat(newNode));
      
      // Reset input form after adding
      setNodeName('');
      setNodePhoto('');
      setIsActive(false);
    }
  };

  const onSave = () => {
    const data = { nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tree.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const onLoad = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.nodes && Array.isArray(data.nodes) && data.edges && Array.isArray(data.edges)) {
          setNodes(data.nodes);
          setEdges(data.edges);
        } else {
          alert('Unsupported file format.');
        }
      } catch(err) {
        alert('Error reading file.');
      }
    };
    reader.readAsText(file);
    event.target.value = null; // reset
  };

  const displayEdges = edges.map((edge) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    const isBothActive = sourceNode?.data?.isActive && targetNode?.data?.isActive;
    return {
      ...edge,
      className: isBothActive ? 'edge-active' : 'edge-inactive',
    };
  });

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000' }}>
      <ReactFlow
        nodes={nodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        nodesDraggable={true}
        snapToGrid={true}
        snapGrid={[10, 10]}
        defaultEdgeOptions={{ type: 'step' }}
        fitView
      >
        <Controls />
        <Background color="#1a881a" gap={20} variant="cross" />
        <Panel position="top-left" style={{ background: 'rgba(5,5,5,0.85)', padding: '15px', border: '1px solid #33ff33', color: '#33ff33', borderRadius: '5px', zIndex: 10, fontFamily: '"Courier New", Courier, monospace' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: isPanelOpen ? '10px' : '0' }}>
            <h3 style={{ margin: 0, lineHeight: '1', display: 'flex', alignItems: 'center' }}>
              {isPanelOpen ? (selectedNodeId ? 'Edit Node' : 'Create Node') : 'Editor Menu'}
            </h3>
            <button 
              onClick={() => setIsPanelOpen(!isPanelOpen)} 
              style={{ background: 'transparent', color: '#33ff33', border: '1px solid #33ff33', borderRadius: '3px', cursor: 'pointer', padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', fontFamily: '"Courier New", Courier, monospace', textTransform: 'uppercase' }}
            >
              {isPanelOpen ? 'Collapse ^' : 'Expand v'}
            </button>
          </div>
          
          {isPanelOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label>Name: </label>
                <input type="text" value={nodeName} onChange={(e) => setNodeName(e.target.value)} style={{ background: '#000', color: '#33ff33', border: '1px solid #1a881a', marginLeft: '5px', width: '150px', fontFamily: '"Courier New", Courier, monospace' }} />
              </div>
              <div>
                <label>Photo URL: </label>
                <input type="text" value={nodePhoto} onChange={(e) => setNodePhoto(e.target.value)} style={{ background: '#000', color: '#33ff33', border: '1px solid #1a881a', marginLeft: '5px', width: '130px', fontFamily: '"Courier New", Courier, monospace' }} />
              </div>
              <div>
                <label>
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  {' '}{selectedNodeId ? 'Active Node' : 'Active on start'}
                </label>
              </div>
              <button onClick={onSubmit} style={{ background: '#1a881a', color: '#fff', border: 'none', padding: '8px', cursor: 'pointer', fontWeight: 'bold', fontFamily: '"Courier New", Courier, monospace', textTransform: 'uppercase' }}>
                {selectedNodeId ? 'Update Info' : 'Add New Node'}
              </button>
              <hr style={{ borderColor: '#1a881a', width: '100%', margin: '10px 0' }} />
              <button onClick={onSave} style={{ background: '#33ff33', color: '#000', border: 'none', padding: '8px', cursor: 'pointer', fontWeight: 'bold', fontFamily: '"Courier New", Courier, monospace', textTransform: 'uppercase' }}>Save Tree (.json)</button>
              <div>
                <label style={{ display: 'block', margin: '5px 0' }}>Load Tree:</label>
                <input type="file" accept=".json" onChange={onLoad} style={{ color: '#33ff33', fontSize: '12px', width: '180px', fontFamily: '"Courier New", Courier, monospace' }} />
              </div>
              <div style={{ fontSize: '12px', marginTop: '10px', color: '#aaa', lineHeight: '1.5' }}>
                * <b>Editor Tips</b><br/>
                - Click empty space: Add Node mode<br/>
                - Click existing node: Edit Node mode<br/>
                - Backspace: Delete selected node/edge
              </div>
            </div>
          )}
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default App;
