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
  Grid,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useOffline } from '../../contexts/OfflineContext';
import { formsAPI } from '../../services/api';

const PregnancyReportForm = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isOnline, saveFormOffline } = useOffline();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    lmp: '',
    edd: '',
    gravida: '',
    para: '',
    anc_checkups: 'pending',
    risk_factors: 'normalRisk',
    patient_name: '',
    patient_phone: '',
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

  const calculateEDD = (lmpDate) => {
    if (!lmpDate) return '';
    
    const lmp = new Date(lmpDate);
    const edd = new Date(lmp);
    edd.setDate(edd.getDate() + 280); // Add 280 days (40 weeks)
    
    return edd.toISOString().split('T')[0];
  };

  const handleLMPChange = (e) => {
    const lmpValue = e.target.value;
    setFormData({
      ...formData,
      lmp: lmpValue,
      edd: calculateEDD(lmpValue),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const submitData = {
      ...formData,
      lmp: new Date(formData.lmp).toISOString(),
      edd: new Date(formData.edd).toISOString(),
      gravida: parseInt(formData.gravida),
      para: parseInt(formData.para),
    };

    try {
      if (isOnline) {
        await formsAPI.createPregnancyReport(submitData);
        setSuccess(true);
      } else {
        await saveFormOffline('pregnancy_report', submitData);
        setSuccess(true);
      }

      // Reset form
      setFormData({
        lmp: '',
        edd: '',
        gravida: '',
        para: '',
        anc_checkups: 'pending',
        risk_factors: 'normalRisk',
        patient_name: '',
        patient_phone: '',
      });

      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      console.error('Form submission error:', err);
      setError(err.response?.data?.detail || 'Form submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div">
            {t('pregnancyReport.title')}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            {t('pregnancyReport.title')}
          </Typography>

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Form submitted successfully! 
              {!isOnline && ' (Saved offline - will sync when online)'}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="patient_name"
                  label={t('pregnancyReport.patientName')}
                  value={formData.patient_name}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="patient_phone"
                  label={t('pregnancyReport.patientPhone')}
                  value={formData.patient_phone}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  type="tel"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="lmp"
                  label={t('pregnancyReport.lmp')}
                  value={formData.lmp}
                  onChange={handleLMPChange}
                  margin="normal"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="edd"
                  label={t('pregnancyReport.edd')}
                  value={formData.edd}
                  onChange={handleInputChange}
                  margin="normal"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  disabled
                  helperText="Calculated automatically from LMP"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="gravida"
                  label={t('pregnancyReport.gravida')}
                  value={formData.gravida}
                  onChange={handleInputChange}
                  margin="normal"
                  type="number"
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="para"
                  label={t('pregnancyReport.para')}
                  value={formData.para}
                  onChange={handleInputChange}
                  margin="normal"
                  type="number"
                  inputProps={{ min: 0 }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>{t('pregnancyReport.ancCheckups')}</InputLabel>
                  <Select
                    name="anc_checkups"
                    value={formData.anc_checkups}
                    onChange={handleInputChange}
                    required
                  >
                    <MenuItem value="completed">{t('pregnancyReport.completed')}</MenuItem>
                    <MenuItem value="pending">{t('pregnancyReport.pending')}</MenuItem>
                    <MenuItem value="scheduled">{t('pregnancyReport.scheduled')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>{t('pregnancyReport.riskFactors')}</InputLabel>
                  <Select
                    name="risk_factors"
                    value={formData.risk_factors}
                    onChange={handleInputChange}
                    required
                  >
                    <MenuItem value="normalRisk">{t('pregnancyReport.normalRisk')}</MenuItem>
                    <MenuItem value="highRisk">{t('pregnancyReport.highRisk')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
                sx={{ flex: 1 }}
              >
                {t('forms.cancel')}
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ flex: 1 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  t('forms.submit')
                )}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PregnancyReportForm;