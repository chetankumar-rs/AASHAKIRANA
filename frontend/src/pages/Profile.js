import React from 'react';
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
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Divider,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Person } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">{t('navigation.profile')}</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main' }}>
              <Person sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" component="h1">
              {user?.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              ASHA Worker
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <List>
            <ListItem>
              <ListItemText
                primary="Username"
                secondary={user?.username}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('auth.phone')}
                secondary={user?.phone_number}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('auth.place')}
                secondary={user?.place}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Member Since"
                secondary={user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              />
            </ListItem>
          </List>
        </Paper>
      </Container>
    </Box>
  );
};

export default Profile;