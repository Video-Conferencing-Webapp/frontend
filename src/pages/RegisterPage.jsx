import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
  Container,
  Typography,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../redux/slices/auth";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { isLoading, error } = useSelector((state) => state.auth);

  const RegisterSchema = Yup.object().shape({
    username: Yup.string().required("Username is required"),
    email: Yup.string()
      .email("Email must be a valid email address")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(RegisterSchema),
  });

  const onSubmit = async (data) => {
    try {
      await dispatch(registerUser(data));
      enqueueSnackbar("Registration successful", { variant: "success" });
      navigate("/login");
    } catch (error) {
      enqueueSnackbar(error, { variant: "error" });
    }
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
              {...register("username")}
              label="Username"
              error={!!errors.username}
              helperText={errors.username?.message}
            />
            <TextField
              {...register("email")}
              label="Email address"
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              {...register("password")}
              label="Password"
              type="password"
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              disabled={isLoading}
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
      </Stack>
    </Container>
  );
} 