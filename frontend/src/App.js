import React, { useState } from 'react';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import StatsDashboard from './components/StatsDashboard';

function App() {
  const [refresh, setRefresh] = useState(0);

  const handleTicketSubmitted = () => {
    setRefresh(prev => prev + 1);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Support Ticket System</h1>
      <TicketForm onSubmit={handleTicketSubmitted} />
      <TicketList refresh={refresh} />
      <StatsDashboard refresh={refresh} />
    </div>
  );
}

export default App;