import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (event) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/users/signup', { name, phone });
      navigate('/login');
    } catch (err) {
      alert('Signup failed');
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <h2>Signup</h2>
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Phone No" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <button type="submit">Signup</button>
    </form>
  );
}

export default Signup;