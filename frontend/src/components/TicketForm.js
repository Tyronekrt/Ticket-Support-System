import React, { useState } from 'react';
import axios from 'axios';

const TicketForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);

  const handleDescriptionChange = (e) => setDescription(e.target.value);

  const handleDescriptionBlur = async () => {
    if (!description) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/tickets/classify/', { description });
      if (res.data.suggested_category) setCategory(res.data.suggested_category);
      if (res.data.suggested_priority) setPriority(res.data.suggested_priority);
    } catch (err) {
      console.error('LLM classify error:', err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/tickets/', { title, description, category, priority });
      setTitle('');
      setDescription('');
      setCategory('general');
      setPriority('medium');
      onSubmit();
    } catch (err) {
      alert('Error submitting ticket');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '40px' }}>
      <div>
        <label>Title:</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required />
      </div>
      <div>
        <label>Description:</label>
        <textarea value={description} onChange={handleDescriptionChange} onBlur={handleDescriptionBlur} required />
      </div>
      {loading && <p>Loading LLM suggestions...</p>}
      <div>
        <label>Category:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="billing">Billing</option>
          <option value="technical">Technical</option>
          <option value="account">Account</option>
          <option value="general">General</option>
        </select>
      </div>
      <div>
        <label>Priority:</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>
      <button type="submit">Submit Ticket</button>
    </form>
  );
};

export default TicketForm;
