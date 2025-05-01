import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './AdminDashboard.module.css';
import Navbar from '../components/layout/NavBar';

function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('all');
  const [sortField, setSortField] = useState('full_name');
  const [sortDirection, setSortDirection] = useState('asc');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchApplications = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/applications', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setApplications(response.data);
        setFilteredApplications(response.data);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load applications');
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [navigate]);

  useEffect(() => {
    let filtered = [...applications];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.full_name.toLowerCase().includes(searchLower) ||
        app.business_type.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.application_status === statusFilter);
    }

    // Apply business type filter
    if (businessTypeFilter !== 'all') {
      filtered = filtered.filter(app => app.business_type === businessTypeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle numeric fields
      if (sortField === 'loan_amount' || sortField === 'risk_score') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter, businessTypeFilter, sortField, sortDirection]);

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

      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by name or business type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterContainer}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>
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
              <th onClick={() => handleSort('application_status')}>
                Status {getSortIcon('application_status')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((application, index) => (
              <tr key={application.id}>
                <td>{index + 1}</td>
                <td>{application.full_name}</td>
                <td>{application.business_type}</td>
                <td>₹{application.loan_amount.toLocaleString()}</td>
                <td>{application.risk_score}%</td>
                <td>
                  <span className={styles[application.application_status.toLowerCase()]}>
                    {application.application_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredApplications.length === 0 && (
          <div className={styles.noResults}>
            No applications found matching your criteria.
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard; 