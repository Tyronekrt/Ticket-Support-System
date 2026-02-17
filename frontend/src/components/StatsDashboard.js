import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StatsDashboard = ({ refresh }) => {
  const [stats, setStats] = useState({
    total_tickets: 0,
    open_tickets: 0,
    avg_resolution_time: 0,
    tickets_by_priority: {},
  });

  useEffect(() => {
    fetchStats();
  }, [refresh]);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/tickets/stats/');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '30px', backgroundColor: '#f9f9f9' }}>
      <h2>Support Ticket Statistics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        <div>
          <p><strong>Total Tickets:</strong> {stats.total_tickets}</p>
        </div>
        <div>
          <p><strong>Open Tickets:</strong> {stats.open_tickets}</p>
        </div>
        <div>
          <p><strong>Avg Resolution Time:</strong> {Math.round(stats.avg_resolution_time * 100) / 100} days</p>
        </div>
        <div>
          <p><strong>Tickets by Priority:</strong></p>
          <ul>
            {Object.entries(stats.tickets_by_priority || {}).map(([priority, count]) => (
              <li key={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}: {count}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
