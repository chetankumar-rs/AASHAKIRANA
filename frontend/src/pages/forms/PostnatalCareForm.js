import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  AppBar,
  Toolbar,
  IconButton,
  Grid,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useOffline } from '../../contexts/OfflineContext';
import { formsAPI } from '../../services/api';

const PostnatalCareForm = () => {
  const { t } = useTranslation();
  const { isOnline, saveFormOffline } = useOffline();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    pnc_visits: '',
    mother_health: '',
    baby_health: '',
    counselling: '',
    mother_name: '',
    delivery_date: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const submitData = {
      ...formData,
      delivery_date: new Date(formData.delivery_date).toISOString(),
    };

    try {
      if (isOnline) {
        await formsAPI.createPostnatalCare(submitData);
        setSuccess(true);
      } else {
        await saveFormOffline('postnatal_care', submitData);
        setSuccess(true);
      }

      setFormData({
        pnc_visits: '',
        mother_health: '',
        baby_health: '',
        counselling: '',
        mother_name: '',
        delivery_date: '',
      });

      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Form submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">{t('postnatalCare.title')}</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>{t('postnatalCare.title')}</Typography>

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Form submitted successfully! {!isOnline && ' (Saved offline)'}
            </Alert>
          )}

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="mother_name"
                  label={t('postnatalCare.motherName')}
                  value={formData.mother_name}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="delivery_date"
                  label={t('postnatalCare.deliveryDate')}
                  value={formData.delivery_date}
                  onChange={handleInputChange}
                  margin="normal"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="pnc_visits"
                  label={t('postnatalCare.pncVisits')}
                  value={formData.pnc_visits}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={3}
                  required
                  helperText="Details of PNC visits (dates, checkup details)"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="mother_health"
                  label={t('postnatalCare.motherHealth')}
                  value={formData.mother_health}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={3}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="baby_health"
                  label={t('postnatalCare.babyHealth')}
                  value={formData.baby_health}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={3}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="counselling"
                  label={t('postnatalCare.counselling')}
                  value={formData.counselling}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={3}
                  required
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/')} sx={{ flex: 1 }}>
                {t('forms.cancel')}
              </Button>
              <Button type="submit" variant="contained" disabled={loading} sx={{ flex: 1 }}>
                {loading ? <CircularProgress size={24} /> : t('forms.submit')}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PostnatalCareForm;