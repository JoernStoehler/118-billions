import React from 'react';

const AdminControls: React.FC = () => {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 1000 }}>
      <button style={{ margin: '5px', padding: '10px', backgroundColor: 'green', color: 'white' }}>👍</button>
      <button style={{ margin: '5px', padding: '10px', backgroundColor: 'red', color: 'white' }}>👎</button>
    </div>
  );
};

export default AdminControls;