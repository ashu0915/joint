import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {getUserFromToken} from '../utils/getTokenUser';


function Dashboard() {
  const navigate = useNavigate();
  const [group, setGroup] = useState('');
  const [wallet, setWallet] = useState(0);
  const [groupName, setGroupName] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [paymentData, setPaymentData] = useState({ to: '', amounts: '' , from: ''});
  const [rawUserIds, setRawUserIds] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  
  const user = getUserFromToken();
  
  useEffect(() => {
    fetchGroup();
    fetchWallet();
  }, []);

  const handleMemberInput = (e) => {
    const input = e.target.value;
    setRawUserIds(input);

    // Convert comma-separated input to array of numbers
    const ids = input
      .split(',')
      .map(id => id.trim())
      .filter(id => id !== '')
      .map(Number);

    setSelectedMemberIds(ids);
  };
  
  const fetchGroup = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/groups/mygroup', { headers });
      console.log("fetchGroup: ",res, res.data.groups[0].name);
      setGroup(res.data.groups[0].name);
    } catch (err) {
      console.error('Error fetching group');
    }
  };

  const fetchWallet = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/users/wallet', { headers });
      setWallet(res.data.wallet_balance);
    } catch (err) {
      console.error('Error fetching wallet');
    }
  };

  const createGroup = async () => {
    try {
      const res = await axios.post('http://localhost:8000/api/groups/create', { name: groupName, members: selectedMemberIds }, { headers });
      alert('Group created');
      fetchGroup();
    } catch (err) {
      alert('Failed to create group');
    }
  };

  const deposit = async () => {
    try {
      await axios.post('http://localhost:8000/api/deposits', { amount: depositAmount }, { headers });
      alert('Deposit successful');
      fetchWallet();
    } catch (err) {
      alert('Deposit failed');
    }
  };

  const makePayment = async () => {
    try {
      await axios.post('http://localhost:8000/api/payment/start', {to: paymentData.to,
        amounts: paymentData.amounts,
        from: paymentData.from}, { headers });
      alert('Payment successful');
      fetchWallet();
    } catch (err) {
      alert('Payment failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Wallet Balance: ₹{wallet}</p>

      <div>
      <h3>Create Group</h3>
      <input placeholder="Group Name" value={groupName} onChange={(e) => setGroupName(e.target.value)}/>
      <br />
      <input placeholder="Enter User IDs (comma separated)" value={rawUserIds} onChange={handleMemberInput}/>
      <br />
      <button onClick={createGroup}>Create Group</button>
      </div>

      <h3>My Group</h3>
      {group ? <p>{group}</p> : <p>No group joined</p>}

      {/* <h3>Deposit</h3>
      <input placeholder="Amount" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
      <button onClick={deposit}>Deposit</button> */}

      <h3>Make Payment</h3>
      <input placeholder="Merchant_upi" value={paymentData.to} onChange={(e) => setPaymentData({ ...paymentData, to: e.target.value })} />
      <input placeholder="Amount" value={paymentData.amount} onChange={(e) => setPaymentData({ ...paymentData, amounts: e.target.value })} />
      <input placeholder="Group_id" value={paymentData.from} onChange={(e) => setPaymentData({ ...paymentData, from: e.target.value })} />
      <button onClick={makePayment}>Pay</button>

      <br /><br />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;