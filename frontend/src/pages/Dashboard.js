import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardAPI } from '../services/api';
import { useOffline } from '../contexts/OfflineContext';
import { offlineStorage } from '../services/offlineStorage';

const Dashboard = () => {
  const { t } = useTranslation();
  const { isOnline } = useOffline();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_surveys: 0,
    total_pregnancies: 0,
    total_vaccinations: 0,
    total_pnc: 0,
    unread_alerts: 0,
    incentives_earned: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [isOnline]);

  const fetchDashboardData = async () => {
    try {
      if (isOnline) {
        const response = await dashboardAPI.getStats();
        setStats(response.data);
        await offlineStorage.saveDashboardData(response.data);
      } else {
        const offlineData = await offlineStorage.getOfflineDashboardData();
        if (offlineData) {
          setStats(offlineData);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const performanceData = [
    { month: 'Jan', surveys: 12, pregnancies: 8 },
    { month: 'Feb', surveys: 15, pregnancies: 10 },
    { month: 'Mar', surveys: 18, pregnancies: 12 },
    { month: 'Apr', surveys: 22, pregnancies: 15 },
    { month: 'May', surveys: 25, pregnancies: 18 },
    { month: 'Jun', surveys: stats.total_surveys, pregnancies: stats.total_pregnancies },
  ];

  const workDistribution = [
    { name: 'Family Surveys', value: stats.total_surveys, color: '#2196f3' },
    { name: 'Pregnancies', value: stats.total_pregnancies, color: '#e91e63' },
    { name: 'Vaccinations', value: stats.total_vaccinations, color: '#4caf50' },
    { name: 'PNC Visits', value: stats.total_pnc, color: '#9c27b0' },
  ];

  const StatCard = ({ title, value, color = '#2196f3' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography color="textSecondary" gutterBottom variant="h6">
          {title}
        </Typography>
        <Typography variant="h3" component="div" style={{ color }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">{t('dashboard.title')}</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('dashboard.title')}
        </Typography>

        {/* Key Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard 
              title={t('dashboard.totalSurveys')} 
              value={stats.total_surveys}
              color="#2196f3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard 
              title={t('dashboard.totalPregnancies')} 
              value={stats.total_pregnancies}
              color="#e91e63"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard 
              title={t('dashboard.totalVaccinations')} 
              value={stats.total_vaccinations}
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard 
              title={t('dashboard.totalPnc')} 
              value={stats.total_pnc}
              color="#9c27b0"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard 
              title={t('dashboard.unreadAlerts')} 
              value={stats.unread_alerts}
              color="#ff5722"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard 
              title={t('dashboard.incentivesEarned')} 
              value={`₹${stats.incentives_earned}`}
              color="#009688"
            />
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.performance')}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="surveys" stroke="#2196f3" strokeWidth={2} />
                  <Line type="monotone" dataKey="pregnancies" stroke="#e91e63" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Work Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={workDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {workDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;