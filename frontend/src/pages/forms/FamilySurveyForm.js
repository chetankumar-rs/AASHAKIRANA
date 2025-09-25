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
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useOffline } from '../../contexts/OfflineContext';
import { formsAPI } from '../../services/api';

const FamilySurveyForm = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isOnline, saveFormOffline } = useOffline();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    household_id: '',
    members_list: '',
    sanitation: 'good',
    chronic_illnesses: '',
  });

  const [chronicIllnessOptions, setChronicIllnessOptions] = useState({
    none: false,
    diabetes: false,
    hypertension: false,
    heartDisease: false,
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

  const handleChronicIllnessChange = (e) => {
    const { name, checked } = e.target;
    
    if (name === 'none' && checked) {
      // If 'none' is selected, uncheck all others
      setChronicIllnessOptions({
        none: true,
        diabetes: false,
        hypertension: false,
        heartDisease: false,
      });
    } else if (name !== 'none' && checked) {
      // If any illness is selected, uncheck 'none'
      setChronicIllnessOptions({
        ...chronicIllnessOptions,
        none: false,
        [name]: checked,
      });
    } else {
      setChronicIllnessOptions({
        ...chronicIllnessOptions,
        [name]: checked,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Compile chronic illnesses
    const selectedIllnesses = Object.entries(chronicIllnessOptions)
      .filter(([key, value]) => value)
      .map(([key, value]) => t(`familySurvey.${key}`))
      .join(', ');

    const submitData = {
      ...formData,
      chronic_illnesses: selectedIllnesses,
    };

    try {
      if (isOnline) {
        // Submit to server
        await formsAPI.createFamilySurvey(submitData);
        setSuccess(true);
      } else {
        // Save offline
        await saveFormOffline('family_survey', submitData);
        setSuccess(true);
      }

      // Reset form
      setFormData({
        household_id: '',
        members_list: '',
        sanitation: 'good',
        chronic_illnesses: '',
      });
      setChronicIllnessOptions({
        none: false,
        diabetes: false,
        hypertension: false,
        heartDisease: false,
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
            {t('familySurvey.title')}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            {t('familySurvey.title')}
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
            <TextField
              fullWidth
              name="household_id"
              label={t('familySurvey.householdId')}
              value={formData.household_id}
              onChange={handleInputChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              name="members_list"
              label={t('familySurvey.membersList')}
              value={formData.members_list}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={3}
              required
              helperText="List all family members with their ages (e.g., John - 45, Mary - 42, etc.)"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>{t('familySurvey.sanitation')}</InputLabel>
              <Select
                name="sanitation"
                value={formData.sanitation}
                onChange={handleInputChange}
                required
              >
                <MenuItem value="good">{t('familySurvey.good')}</MenuItem>
                <MenuItem value="average">{t('familySurvey.average')}</MenuItem>
                <MenuItem value="poor">{t('familySurvey.poor')}</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              {t('familySurvey.chronicIllnesses')}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="none"
                    checked={chronicIllnessOptions.none}
                    onChange={handleChronicIllnessChange}
                  />
                }
                label={t('familySurvey.none')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="diabetes"
                    checked={chronicIllnessOptions.diabetes}
                    onChange={handleChronicIllnessChange}
                  />
                }
                label={t('familySurvey.diabetes')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="hypertension"
                    checked={chronicIllnessOptions.hypertension}
                    onChange={handleChronicIllnessChange}
                  />
                }
                label={t('familySurvey.hypertension')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="heartDisease"
                    checked={chronicIllnessOptions.heartDisease}
                    onChange={handleChronicIllnessChange}
                  />
                }
                label={t('familySurvey.heartDisease')}
              />
            </Box>

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

export default FamilySurveyForm;