import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const { t, i18n } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    place: '',
    aadhaar_number: '',
    password: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'kn' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await register(formData);
      
      if (result.success) {
        navigate('/login', { 
          state: { 
            message: t('auth.registrationSuccess'),
            username: result.user.username 
          } 
        });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(t('auth.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 3,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" color="primary" fontWeight="bold">
              {t('app.name')}
            </Typography>
            <IconButton onClick={toggleLanguage} color="primary">
              <LanguageIcon />
            </IconButton>
          </Box>

          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            {t('app.tagline')}
          </Typography>

          <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
            {t('auth.register')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              name="name"
              label={t('auth.name')}
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
              autoFocus
            />

            <TextField
              fullWidth
              name="phone_number"
              label={t('auth.phone')}
              value={formData.phone_number}
              onChange={handleChange}
              margin="normal"
              required
              type="tel"
            />

            <TextField
              fullWidth
              name="place"
              label={t('auth.place')}
              value={formData.place}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              name="aadhaar_number"
              label={t('auth.aadhaar')}
              value={formData.aadhaar_number}
              onChange={handleChange}
              margin="normal"
              required
              inputProps={{ maxLength: 12 }}
            />

            <TextField
              fullWidth
              name="password"
              label={t('auth.password')}
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              inputProps={{ minLength: 6 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('auth.createAccount')
              )}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                {t('auth.alreadyHaveAccount')}{' '}
                <Link to="/login" style={{ color: '#2196f3' }}>
                  {t('auth.login')}
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;