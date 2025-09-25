import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Paper,
  Chip,
  AppBar,
  Toolbar,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  NotificationsActive,
  CheckCircle,
  Warning,
  Info,
} from '@mui/icons-material';
import { alertsAPI } from '../services/api';
import { useOffline } from '../contexts/OfflineContext';
import { offlineStorage } from '../services/offlineStorage';

const Alerts = () => {
  const { t } = useTranslation();
  const { isOnline } = useOffline();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, [isOnline]);

  const fetchAlerts = async () => {
    try {
      if (isOnline) {
        const response = await alertsAPI.getAlerts();
        setAlerts(response.data);
      } else {
        const offlineAlerts = await offlineStorage.getOfflineAlerts();
        setAlerts(offlineAlerts);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId) => {
    try {
      if (isOnline) {
        await alertsAPI.markAlertRead(alertId);
      } else {
        await offlineStorage.markAlertRead(alertId);
      }
      
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'anc':
        return <NotificationsActive color="primary" />;
      case 'vaccination':
        return <Warning color="warning" />;
      case 'pnc':
        return <Info color="info" />;
      default:
        return <NotificationsActive />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'anc':
        return 'primary';
      case 'vaccination':
        return 'warning';
      case 'pnc':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">{t('alerts.title')}</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('alerts.title')}
        </Typography>

        {!isOnline && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You are offline. Showing cached alerts.
          </Alert>
        )}

        {alerts.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              {t('alerts.noAlerts')}
            </Typography>
          </Paper>
        ) : (
          <List>
            {alerts.map((alert) => (
              <Paper key={alert.id} sx={{ mb: 2, overflow: 'hidden' }}>
                <ListItem
                  sx={{
                    backgroundColor: alert.is_read ? 'inherit' : '#f5f5f5',
                  }}
                  secondaryAction={
                    !alert.is_read && (
                      <IconButton
                        edge="end"
                        onClick={() => markAsRead(alert.id)}
                        title={t('alerts.markAsRead')}
                      >
                        <CheckCircle />
                      </IconButton>
                    )
                  }
                >
                  <ListItemIcon>
                    {getAlertIcon(alert.alert_type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">
                          {alert.title}
                        </Typography>
                        <Chip
                          label={t(`alerts.${alert.alert_type}`)}
                          size="small"
                          color={getAlertColor(alert.alert_type)}
                        />
                        {!alert.is_read && (
                          <Chip label="New" size="small" color="error" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {alert.message}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Patient: {alert.patient_name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Due: {new Date(alert.due_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </Paper>
            ))}
          </List>
        )}
      </Container>
    </Box>
  );
};

export default Alerts;