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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useOffline } from '../../contexts/OfflineContext';
import { formsAPI } from '../../services/api';

const LeprosyReportForm = () => {
  const { t } = useTranslation();
  const { isOnline, saveFormOffline } = useOffline();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patient_name: '',
    leprosy_type: 'paucibacillary',
    treatment: '',
    follow_ups: '',
    household_contacts: '',
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

    try {
      if (isOnline) {
        await formsAPI.createLeprosyReport(formData);
        setSuccess(true);
      } else {
        await saveFormOffline('leprosy_report', formData);
        setSuccess(true);
      }

      setFormData({
        patient_name: '',
        leprosy_type: 'paucibacillary',
        treatment: '',
        follow_ups: '',
        household_contacts: '',
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
          <Typography variant="h6">{t('leprosyReport.title')}</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>{t('leprosyReport.title')}</Typography>

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Form submitted successfully! {!isOnline && ' (Saved offline)'}
            </Alert>
          )}

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              name="patient_name"
              label={t('leprosyReport.patientName')}
              value={formData.patient_name}
              onChange={handleInputChange}
              margin="normal"
              required
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>{t('leprosyReport.leprosyType')}</InputLabel>
              <Select
                name="leprosy_type"
                value={formData.leprosy_type}
                onChange={handleInputChange}
                required
              >
                <MenuItem value="paucibacillary">{t('leprosyReport.paucibacillary')}</MenuItem>
                <MenuItem value="multibacillary">{t('leprosyReport.multibacillary')}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              name="treatment"
              label={t('leprosyReport.treatment')}
              value={formData.treatment}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={3}
              required
            />

            <TextField
              fullWidth
              name="follow_ups"
              label={t('leprosyReport.followUps')}
              value={formData.follow_ups}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={2}
              required
            />

            <TextField
              fullWidth
              name="household_contacts"
              label={t('leprosyReport.householdContacts')}
              value={formData.household_contacts}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={2}
              required
            />

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

export default LeprosyReportForm;