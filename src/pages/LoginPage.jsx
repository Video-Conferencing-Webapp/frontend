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
import { loginUser } from "../redux/slices/auth";
import { useSnackbar } from "notistack";

export default function LoginPage() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isLoading, error } = useSelector((state) => state.auth);

  const LoginSchema = Yup.object().shape({
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(LoginSchema),
  });

  const onSubmit = async (data) => {
    try {
      await dispatch(loginUser(data));
      enqueueSnackbar("Login successful", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(error, { variant: "error" });
    }
  };

  return (
    <Container maxWidth="xs">
      <Stack spacing={3} sx={{ mt: 12 }}>
        <Typography variant="h4" gutterBottom>
          Login
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
              Login
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