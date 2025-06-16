import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Container, Typography, TextField, Button, Stack, Link, IconButton, InputAdornment } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import { register } from '../redux/slices/authSlice';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const RegisterSchema = Yup.object().shape({
    fullName: Yup.string().required('Full name is required'),
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const onSubmit = (data) => {
    dispatch(register(data));
  };

  return (
    <Container maxWidth="xs">
      <Stack spacing={3} sx={{ mt: 12 }}>
        <Typography variant="h4" gutterBottom>
          Register
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <TextField
              {...registerField('fullName')}
              label="Full Name"
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
            />
            <TextField
              {...registerField('email')}
              label="Email address"
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              {...registerField('password')}
              label="Password"
              type={showPassword ? 'text' : 'password'}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              disabled={loading}
            >
              Register
            </Button>
          </Stack>
        </form>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
          Already have an account?{' '}
          <Link variant="subtitle2" component={RouterLink} to="/login">
            Login
          </Link>
        </Typography>
      </Stack>
    </Container>
  );
} 