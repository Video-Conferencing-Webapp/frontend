import PropTypes from "prop-types";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  styled,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/auth";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: "none",
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export default function MainLayout({ children }) {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      <StyledAppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Meet Clone
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </StyledAppBar>
      <Box component="main" sx={{ p: 3 }}>
        {children}
      </Box>
    </>
  );
}

MainLayout.propTypes = {
  children: PropTypes.node,
}; 