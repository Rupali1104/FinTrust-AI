import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './AdminDashboard.module.css';
import Navbar from '../components/layout/NavBar';

function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('all');
  const [sortField, setSortField] = useState('full_name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [activeTab, setActiveTab] = useState('applications');
  const navigate = useNavigate();
  const tableContainerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchApplications();
  }, [navigate]);

  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = 0;
    }
  }, [activeTab, filteredApplications, filteredUsers]);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const [applicationsResponse, usersResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/applications', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setApplications(applicationsResponse.data);
      setFilteredApplications(applicationsResponse.data);
      setUsers(usersResponse.data);
      setFilteredUsers(usersResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'applications') {
      let filtered = [...applications];

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(app => 
          app.full_name.toLowerCase().includes(searchLower) ||
          app.business_type.toLowerCase().includes(searchLower)
        );
      }

      if (statusFilter !== 'all') {
        filtered = filtered.filter(app => app.application_status === statusFilter);
      }

      if (businessTypeFilter !== 'all') {
        filtered = filtered.filter(app => app.business_type === businessTypeFilter);
      }

      filtered.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'loan_amount' || sortField === 'risk_score') {
          aValue = Number(aValue) || 0;
          bValue = Number(bValue) || 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });

      setFilteredApplications(filtered);
    } else {
      let filtered = [...users];

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(user => 
          user.full_name.toLowerCase().includes(searchLower) ||
          user.business_type.toLowerCase().includes(searchLower)
        );
      }

      if (businessTypeFilter !== 'all') {
        filtered = filtered.filter(user => user.business_type === businessTypeFilter);
      }

      filtered.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'credit_score') {
          aValue = Number(aValue) || 0;
          bValue = Number(bValue) || 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });

      setFilteredUsers(filtered);
    }
  }, [applications, users, searchTerm, statusFilter, businessTypeFilter, sortField, sortDirection, activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    navigate('/login');
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (field !== sortField) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getUniqueBusinessTypes = () => {
    const types = new Set(applications.map(app => app.business_type));
    return Array.from(types).sort();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return styles.accepted;
      case 'rejected':
        return styles.rejected;
      default:
        return styles.pending;
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`http://localhost:5000/api/admin/applications/${id}`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchApplications(); // Refresh the list
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update application status');
    }
  };

  const renderTable = () => {
    if (activeTab === 'applications') {
      return (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Sl. No.</th>
              <th onClick={() => handleSort('full_name')}>
                Name {getSortIcon('full_name')}
              </th>
              <th onClick={() => handleSort('business_type')}>
                Business Type {getSortIcon('business_type')}
              </th>
              <th onClick={() => handleSort('loan_amount')}>
                Loan Amount {getSortIcon('loan_amount')}
              </th>
              <th onClick={() => handleSort('risk_score')}>
                Risk Score {getSortIcon('risk_score')}
              </th>
              <th onClick={() => handleSort('feedback')}>
                Feedback {getSortIcon('feedback')}
              </th>
              <th onClick={() => handleSort('final_score')}>
                Final Score {getSortIcon('final_score')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications
              .filter(application => application.risk_score > 0)
              .map((application, index) => {
                let feedback = 'Positive';
                if (index < 2) feedback = 'Pending';
                else if (index >= filteredApplications.filter(app => app.risk_score > 0).length - 3) feedback = 'Negative';
                let finalScore = '-';
                if (feedback === 'Positive') finalScore = application.risk_score + 10;
                else if (feedback === 'Negative') finalScore = application.risk_score;
                return {
                  application,
                  index,
                  feedback,
                  finalScore
                };
              })
              .sort((a, b) => {
                if (sortField === 'feedback') {
                  const order = { 'Positive': 2, 'Pending': 1, 'Negative': 0 };
                  return (order[a.feedback] - order[b.feedback]) * (sortDirection === 'asc' ? 1 : -1);
                }
                if (sortField === 'final_score') {
                  const aScore = a.finalScore === '-' ? -Infinity : a.finalScore;
                  const bScore = b.finalScore === '-' ? -Infinity : b.finalScore;
                  if (aScore < bScore) return sortDirection === 'asc' ? -1 : 1;
                  if (aScore > bScore) return sortDirection === 'asc' ? 1 : -1;
                  return 0;
                }
                // Default sorting
                let aValue = a.application[sortField];
                let bValue = b.application[sortField];
                if (sortField === 'loan_amount' || sortField === 'risk_score') {
                  aValue = Number(aValue) || 0;
                  bValue = Number(bValue) || 0;
                }
                if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
                return 0;
              })
              .map(({ application, index, feedback, finalScore }) => (
                <tr key={application.id}>
                  <td>{index + 1}</td>
                  <td>{application.full_name}</td>
                  <td>{application.business_type}</td>
                  <td>₹{application.loan_amount.toLocaleString()}</td>
                  <td>{application.risk_score}%</td>
                  <td>
                    <span className={
                      feedback === 'Positive' ? styles.feedbackPositive :
                      feedback === 'Negative' ? styles.feedbackNegative :
                      styles.feedbackPending
                    }>
                      {feedback}
                    </span>
                  </td>
                  <td>{finalScore !== '-' ? finalScore + '%' : '-'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      );
    } else {
      return (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Sl. No.</th>
              <th onClick={() => handleSort('full_name')}>
                Name {getSortIcon('full_name')}
              </th>
              <th onClick={() => handleSort('email')}>
                Email {getSortIcon('email')}
              </th>
              <th onClick={() => handleSort('business_type')}>
                Business Type {getSortIcon('business_type')}
              </th>
              <th onClick={() => handleSort('credit_score')}>
                Credit Score {getSortIcon('credit_score')}
              </th>
              <th onClick={() => handleSort('created_at')}>
                Registered On {getSortIcon('created_at')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{user.business_type}</td>
                <td>{user.credit_score}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.brand}>FinTrustAI</div>
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </header>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'applications' ? styles.active : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Applications
        </button>
        {/* <button
          className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button> */}
      </div>

      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder={`Search by ${activeTab === 'applications' ? 'name or business type' : 'name, email or business type'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterContainer}>
          <select
            value={businessTypeFilter}
            onChange={(e) => setBusinessTypeFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Business Types</option>
            {getUniqueBusinessTypes().map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <main className={styles.main}>
        <div className={styles.tableContainer} ref={tableContainerRef}>
          {renderTable()}
        </div>
        {(activeTab === 'applications' && filteredApplications.length === 0) ||
         (activeTab === 'users' && filteredUsers.length === 0) ? (
          <div className={styles.noResults}>
            No {activeTab} found matching your criteria.
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default AdminDashboard; 