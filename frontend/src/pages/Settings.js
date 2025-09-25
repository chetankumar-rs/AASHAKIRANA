import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Language as LanguageIcon,
  DarkMode,
  Sync as SyncIcon,
  Info,
} from '@mui/icons-material';
import { useOffline } from '../contexts/OfflineContext';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { syncPendingData, pendingSyncCount, isSyncing } = useOffline();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'en' ? 'kn' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleSync = async () => {
    const result = await syncPendingData();
    // You could show a toast notification here
    console.log('Sync result:', result);
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">{t('settings.title')}</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ overflow: 'hidden' }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              {t('settings.title')}
            </Typography>
          </Box>

          <List>
            <ListItem>
              <ListItemIcon>
                <LanguageIcon />
              </ListItemIcon>
              <ListItemText
                primary={t('settings.language')}
                secondary={`Current: ${i18n.language === 'en' ? 'English' : 'ಕನ್ನಡ'}`}
              />
              <Button variant="outlined" onClick={handleLanguageToggle}>
                Switch
              </Button>
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemIcon>
                <DarkMode />
              </ListItemIcon>
              <ListItemText primary={t('settings.darkMode')} />
              <FormControlLabel
                control={
                  <Switch
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                  />
                }
                label=""
              />
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemIcon>
                <SyncIcon />
              </ListItemIcon>
              <ListItemText
                primary={t('settings.syncSettings')}
                secondary={`${pendingSyncCount} items pending sync`}
              />
              <Button
                variant="outlined"
                onClick={handleSync}
                disabled={isSyncing || pendingSyncCount === 0}
              >
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemIcon>
                <Info />
              </ListItemIcon>
              <ListItemText
                primary={t('settings.about')}
                secondary="AASHAKIRANA v1.0"
              />
            </ListItem>
          </List>
        </Paper>
      </Container>
    </Box>
  );
};

export default Settings;