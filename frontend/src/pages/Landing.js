import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Assignment as AssignmentIcon,
  FamilyRestroom,
  PregnantWoman,
  ChildCare,
  LocalHospital,
  Healing,
  Language as LanguageIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useOffline } from '../contexts/OfflineContext';
import { alertsAPI } from '../services/api';

const Landing = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { isOnline, pendingSyncCount } = useOffline();
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    fetchAlertCount();
  }, []);

  const fetchAlertCount = async () => {
    try {
      if (isOnline) {
        const response = await alertsAPI.getAlerts();
        const unreadCount = response.data.filter(alert => !alert.is_read).length;
        setAlertCount(unreadCount);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'kn' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleCardClick = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formCards = [
    {
      title: t('forms.familySurvey'),
      icon: <FamilyRestroom sx={{ fontSize: 40, color: '#2196f3' }} />,
      path: '/forms/family-survey',
      color: '#e3f2fd',
    },
    {
      title: t('forms.pregnancyReport'),
      icon: <PregnantWoman sx={{ fontSize: 40, color: '#e91e63' }} />,
      path: '/forms/pregnancy-report',
      color: '#fce4ec',
    },
    {
      title: t('forms.leprosyReport'),
      icon: <Healing sx={{ fontSize: 40, color: '#ff9800' }} />,
      path: '/forms/leprosy-report',
      color: '#fff3e0',
    },
    {
      title: t('forms.childVaccination'),
      icon: <ChildCare sx={{ fontSize: 40, color: '#4caf50' }} />,
      path: '/forms/child-vaccination',
      color: '#e8f5e8',
    },
    {
      title: t('forms.postnatalCare'),
      icon: <LocalHospital sx={{ fontSize: 40, color: '#9c27b0' }} />,
      path: '/forms/postnatal-care',
      color: '#f3e5f5',
    },
    {
      title: t('dashboard.title'),
      icon: <DashboardIcon sx={{ fontSize: 40, color: '#607d8b' }} />,
      path: '/dashboard',
      color: '#eceff1',
    },
  ];

  const menuItems = [
    { text: t('navigation.profile'), icon: <PersonIcon />, path: '/profile' },
    { text: t('dashboard.title'), icon: <DashboardIcon />, path: '/dashboard' },
    { text: t('navigation.settings'), icon: <SettingsIcon />, path: '/settings' },
    { text: t('navigation.forms'), icon: <AssignmentIcon />, path: '/' },
    { text: t('navigation.alerts'), icon: <NotificationsIcon />, path: '/alerts' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('app.name')}
          </Typography>

          {/* Connection Status */}
          <Chip
            label={isOnline ? t('sync.online') : t('sync.offline')}
            color={isOnline ? 'success' : 'error'}
            variant="outlined"
            size="small"
            sx={{ mr: 1, color: 'white', borderColor: 'white' }}
          />

          {/* Sync Status */}
          {pendingSyncCount > 0 && (
            <Chip
              label={`${pendingSyncCount} ${t('sync.pendingSync')}`}
              color="warning"
              variant="outlined"
              size="small"
              sx={{ mr: 1, color: 'white', borderColor: 'white' }}
            />
          )}

          {/* Language Toggle */}
          <IconButton color="inherit" onClick={toggleLanguage}>
            <LanguageIcon />
          </IconButton>

          {/* Alerts */}
          <IconButton color="inherit" onClick={() => navigate('/alerts')}>
            <Badge badgeContent={alertCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }} role="presentation">
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">{user?.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              {user?.place}
            </Typography>
          </Box>

          <List>
            {menuItems.map((item, index) => (
              <ListItem 
                button 
                key={index}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
            
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary={t('auth.logout')} />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('navigation.home')}
        </Typography>

        <Typography variant="body1" color="textSecondary" paragraph>
          Welcome back, {user?.name}! Select a form or view your dashboard.
        </Typography>

        <Grid container spacing={3}>
          {formCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  backgroundColor: card.color,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                  transition: 'all 0.2s',
                }}
              >
                <CardActionArea 
                  onClick={() => handleCardClick(card.path)}
                  sx={{ height: '100%' }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Box sx={{ mb: 2 }}>
                      {card.icon}
                    </Box>
                    <Typography variant="h6" component="h2">
                      {card.title}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Landing;