import React from 'react';
import { useNavigateToOffset } from '../features/navigationSlice';

const AdminControls: React.FC = () => {
  const navigateToOffset = useNavigateToOffset();

  const handleAction = async (action: 'like' | 'dislike') => {
    try {
      const response = await fetch('/api/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        navigateToOffset(+1); // Move to the next obituary
      } else {
        console.error('Failed to perform action:', response.statusText);
      }
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 1000 }}>
      <button
        style={{ margin: '5px', padding: '10px', backgroundColor: 'green', color: 'white' }}
        onClick={() => handleAction('like')}
      >
        👍
      </button>
      <button
        style={{ margin: '5px', padding: '10px', backgroundColor: 'red', color: 'white' }}
        onClick={() => handleAction('dislike')}
      >
        👎
      </button>
    </div>
  );
};

export default AdminControls;