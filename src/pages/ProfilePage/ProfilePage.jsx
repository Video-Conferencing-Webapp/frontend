import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Grid,
  Divider,
  Paper,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  VideoCall as VideoCallIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import profileAPI from '../../api/profileAPI';

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editedProfile, setEditedProfile] = useState({
    full_name: '',
    phone: '',
    location: '',
    company: '',
    bio: '',
  });
  const [preferences, setPreferences] = useState({
    auto_join_audio: true,
    auto_join_video: false,
    show_online_status: true,
    email_notifications: true,
    sound_notifications: true,
    meeting_reminders: true,
    chat_notifications: true,
  });
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const profileData = await profileAPI.getProfile();
      setProfile(profileData);
      setEditedProfile({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        location: profileData.location || '',
        company: profileData.company || '',
        bio: profileData.bio || '',
      });
      if (profileData.preferences) {
        setPreferences(profileData.preferences);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      enqueueSnackbar('Failed to load profile data', { 
        variant: 'error',
        autoHideDuration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      await handleSaveProfile();
    } else {
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const updatedProfile = await profileAPI.updateProfile(editedProfile);
      setProfile(prev => ({ ...prev, ...updatedProfile }));
      setIsEditing(false);
      enqueueSnackbar('Profile updated successfully', { 
        variant: 'success',
        autoHideDuration: 3000,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      enqueueSnackbar('Failed to update profile', { 
        variant: 'error',
        autoHideDuration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = async (setting, value) => {
    try {
      const updatedPreferences = { ...preferences, [setting]: value };
      setPreferences(updatedPreferences);
      await profileAPI.updatePreferences({ [setting]: value });
      enqueueSnackbar('Preference updated', { 
        variant: 'success',
        autoHideDuration: 2000,
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      enqueueSnackbar('Failed to update preference', { 
        variant: 'error',
        autoHideDuration: 3000,
      });
      // Revert the change
      setPreferences(preferences);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      company: profile?.company || '',
      bio: profile?.bio || '',
    });
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    try {
      await profileAPI.changePassword(passwordData);
      setChangePasswordDialog(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      enqueueSnackbar('Password changed successfully', { 
        variant: 'success',
        autoHideDuration: 3000,
      });
    } catch (error) {
      console.error('Error changing password:', error);
      enqueueSnackbar('Failed to change password', { 
        variant: 'error',
        autoHideDuration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ p: '0 !important' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }



  return (
    <Container maxWidth="lg" sx={{ p: '0 !important' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #6366f1, #06b6d4)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              p: 3,
              textAlign: 'center',
              height: 'fit-content',
              position: 'sticky',
              top: 20,
              maxWidth: 300,
              mx: 'auto',
            }}
          >
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: '2.5rem',
                  fontWeight: 600,
                  bgcolor: 'primary.main',
                  mb: 2,
                }}
              >
                {getInitials(editedProfile.full_name)}
              </Avatar>
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: -8,
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  '&:hover': { bgcolor: 'background.paper' },
                }}
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              {profile?.full_name || 'User Name'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {profile?.email}
            </Typography>

            <Chip
              label="Online"
              color="success"
              size="small"
              sx={{ mb: 2 }}
            />
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Personal Information */}
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Personal Information
                  </Typography>
                  <Button
                    variant={isEditing ? 'contained' : 'outlined'}
                    startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                    onClick={handleEditToggle}
                    size="small"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : (isEditing ? 'Save' : 'Edit')}
                  </Button>
                </Box>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={editedProfile.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={editedProfile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start"><PhoneIcon sx={{ color: 'text.secondary', fontSize: '1.2rem' }} /></InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={editedProfile.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start"><LocationIcon sx={{ color: 'text.secondary', fontSize: '1.2rem' }} /></InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Company"
                      value={editedProfile.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start"><BusinessIcon sx={{ color: 'text.secondary', fontSize: '1.2rem' }} /></InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Bio"
                      multiline
                      rows={3}
                      value={editedProfile.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      placeholder="Tell us about yourself..."
                    />
                  </Grid>
                </Grid>

                {isEditing && (
                  <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Meeting Preferences */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Meeting Preferences
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.auto_join_audio}
                          onChange={(e) => handlePreferenceChange('auto_join_audio', e.target.checked)}
                        />
                      }
                      label="Auto-join with audio"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.auto_join_video}
                          onChange={(e) => handlePreferenceChange('auto_join_video', e.target.checked)}
                        />
                      }
                      label="Auto-join with video"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.show_online_status}
                          onChange={(e) => handlePreferenceChange('show_online_status', e.target.checked)}
                        />
                      }
                      label="Show online status"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <NotificationsIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Notifications
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.email_notifications}
                          onChange={(e) => handlePreferenceChange('email_notifications', e.target.checked)}
                        />
                      }
                      label="Email notifications"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.sound_notifications}
                          onChange={(e) => handlePreferenceChange('sound_notifications', e.target.checked)}
                        />
                      }
                      label="Sound notifications"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Security
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setChangePasswordDialog(true)}
                  >
                    Change Password
                  </Button>
                  <Button variant="outlined" color="error">
                    Delete Account
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog
        open={changePasswordDialog}
        onClose={() => setChangePasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              variant="outlined"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              variant="outlined"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              variant="outlined"
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handlePasswordChange}
            disabled={!passwordData.current_password || !passwordData.new_password || passwordData.new_password !== passwordData.confirm_password}
          >
            Update Password
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage; 