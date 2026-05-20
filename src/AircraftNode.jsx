import React from 'react';
import { Handle, Position } from '@xyflow/react';

const AircraftNode = ({ data, isConnectable }) => {
  const { label, photo, isActive = false } = data;

  return (
    <div
      className={`aircraft-node ${
        isActive ? 'active' : 'inactive'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        isConnectable={isConnectable}
        className="handle"
        style={{ background: '#33ff33', borderColor: '#000', borderRadius: 0, width: 8, height: 8 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        isConnectable={isConnectable}
        className="handle"
        style={{ background: '#33ff33', borderColor: '#000', borderRadius: 0, width: 8, height: 8 }}
      />
      <div className="image-placeholder">
        {photo ? (
          <img src={photo} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span className="icon">NO IMG</span>
        )}
      </div>
      <div className="label">{label}</div>
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={isConnectable}
        className="handle"
        style={{ background: '#33ff33', borderColor: '#000', borderRadius: 0, width: 8, height: 8 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectable={isConnectable}
        className="handle"
        style={{ background: '#33ff33', borderColor: '#000', borderRadius: 0, width: 8, height: 8 }}
      />
    </div>
  );
};

export default AircraftNode;
