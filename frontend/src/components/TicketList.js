import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TicketList = ({ refresh }) => {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({ status: 'all', category: 'all', priority: 'all' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchTickets();
  }, [refresh, filters, page]);

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.priority !== 'all') params.append('priority', filters.priority);
      params.append('page', page);

      const res = await axios.get(`/api/tickets/?${params.toString()}`);
      setTickets(res.data.results || res.data);
      setTotal(res.data.count || res.data.length);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  };

  const updateStatus = async (ticketId, newStatus) => {
    try {
      await axios.patch(`/api/tickets/${ticketId}/`, { status: newStatus });
      fetchTickets();
    } catch (err) {
      alert('Error updating ticket');
    }
  };

  return (
    <div>
      <h2>Tickets</h2>
      <div style={{ marginBottom: '20px' }}>
        <select value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}>
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={filters.category} onChange={(e) => { setFilters({ ...filters, category: e.target.value }); setPage(1); }}>
          <option value="all">All Categories</option>
          <option value="billing">Billing</option>
          <option value="technical">Technical</option>
          <option value="account">Account</option>
          <option value="general">General</option>
        </select>
        <select value={filters.priority} onChange={(e) => { setFilters({ ...filters, priority: e.target.value }); setPage(1); }}>
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div>
        {tickets.length === 0 ? (
          <p>No tickets found</p>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
              <h3>{ticket.title}</h3>
              <p>{ticket.description}</p>
              <p><strong>Category:</strong> {ticket.category} | <strong>Priority:</strong> {ticket.priority}</p>
              <div>
                <label>Status: </label>
                <select value={ticket.status} onChange={(e) => updateStatus(ticket.id, e.target.value)}>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <small>Created: {new Date(ticket.created_at).toLocaleDateString()}</small>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Previous</button>
        <span> Page {page} </span>
        <button onClick={() => setPage(page + 1)} disabled={tickets.length < 10}>Next</button>
      </div>
    </div>
  );
};

export default TicketList;
