import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/layout/NavBar';
import '../styles/Admin.css';

const generateDummyUsers = () => {
  const names = [
    'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Deepika Singh', 'Vikram Reddy',
    'Anjali Gupta', 'Rahul Mehta', 'Sneha Joshi', 'Arjun Malhotra', 'Kavita Verma',
    'Sanjay Iyer', 'Meera Kapoor', 'Rohan Desai', 'Neha Choudhary', 'Aditya Mishra'
  ];
  
  const businessTypes = [
    'Grocery Store', 'Vegetable Vendor', 'Fruit Stall', 'Food Stall', 
    'Tea Shop', 'Snack Stall', 'Mobile Repair', 'Tailoring Shop',
    'Stationery Shop', 'Flower Stall', 'Paan Shop', 'Small Restaurant'
  ];
  
  // Generate 9 approved users (60%) and 6 rejected users (40%)
  const users = Array.from({ length: 15 }, (_, index) => {
    let score, status;
    
    if (index < 9) { // First 9 users will be approved
      score = Math.floor(Math.random() * 16) + 75; // Scores between 75-90
      status = 'Approved';
    } else { // Last 6 users will be rejected
      score = Math.floor(Math.random() * 11) + 65; // Scores between 65-75
      status = 'Rejected';
    }
    
    return {
      _id: `user_${index + 1}`,
      name: names[index],
      businessType: businessTypes[Math.floor(Math.random() * businessTypes.length)],
      creditScore: score,
      status: status
    };
  });

  // Shuffle the array to randomize the order
  return users.sort(() => Math.random() - 0.5);
};

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      const generatedUsers = generateDummyUsers();
      setUsers(generatedUsers);
      setFilteredUsers(generatedUsers);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let result = [...users];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.businessType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(user => user.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'score') {
        return sortOrder === 'asc'
          ? a.creditScore - b.creditScore
          : b.creditScore - a.creditScore;
      }
      return 0;
    });

    setFilteredUsers(result);
  }, [users, searchTerm, sortBy, sortOrder, statusFilter]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <NavBar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <NavBar />
      <div className="table-container">
        <div className="table-header">
          <h2>User Scores</h2>
          <div className="table-controls">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by name or business..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-controls">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <button 
                className={`sort-button ${sortBy === 'name' ? 'active' : ''}`}
                onClick={() => handleSort('name')}
              >
                Sort by Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                className={`sort-button ${sortBy === 'score' ? 'active' : ''}`}
                onClick={() => handleSort('score')}
              >
                Sort by Score {sortBy === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>
        </div>
        <table className="users-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Business Type</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.name}</td>
                <td>{user.businessType}</td>
                <td>{user.creditScore}/100</td>
                <td>
                  <span className={`status-badge ${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin; 