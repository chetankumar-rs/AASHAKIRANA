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

const ChildVaccinationForm = () => {
  const { t } = useTranslation();
  const { isOnline, saveFormOffline } = useOffline();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    child_name: '',
    child_dob: '',
    vaccine_schedule: '',
    missed_doses: '',
    next_due: '',
    parent_name: '',
    parent_phone: '',
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
      child_dob: new Date(formData.child_dob).toISOString(),
      next_due: new Date(formData.next_due).toISOString(),
    };

    try {
      if (isOnline) {
        await formsAPI.createChildVaccination(submitData);
        setSuccess(true);
      } else {
        await saveFormOffline('child_vaccination', submitData);
        setSuccess(true);
      }

      setFormData({
        child_name: '',
        child_dob: '',
        vaccine_schedule: '',
        missed_doses: '',
        next_due: '',
        parent_name: '',
        parent_phone: '',
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
          <Typography variant="h6">{t('childVaccination.title')}</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>{t('childVaccination.title')}</Typography>

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
                  name="child_name"
                  label={t('childVaccination.childName')}
                  value={formData.child_name}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="child_dob"
                  label={t('childVaccination.childDob')}
                  value={formData.child_dob}
                  onChange={handleInputChange}
                  margin="normal"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="parent_name"
                  label={t('childVaccination.parentName')}
                  value={formData.parent_name}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="parent_phone"
                  label={t('childVaccination.parentPhone')}
                  value={formData.parent_phone}
                  onChange={handleInputChange}
                  margin="normal"
                  type="tel"
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="vaccine_schedule"
                  label={t('childVaccination.vaccineSchedule')}
                  value={formData.vaccine_schedule}
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
                  name="missed_doses"
                  label={t('childVaccination.missedDoses')}
                  value={formData.missed_doses}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="next_due"
                  label={t('childVaccination.nextDue')}
                  value={formData.next_due}
                  onChange={handleInputChange}
                  margin="normal"
                  type="date"
                  InputLabelProps={{ shrink: true }}
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

export default ChildVaccinationForm;