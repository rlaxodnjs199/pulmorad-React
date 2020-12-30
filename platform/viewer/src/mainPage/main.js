import React, { useState, useContext } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import BlurOnIcon from '@material-ui/icons/BlurOn';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { login } from './login/loginService.js';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { useHistory } from 'react-router-dom';
import UserAuthContext from '../context/UserAuthContext';

const customtheme = createMuiTheme({
  palette: {
    primary: {
      light: '#534bae',
      main: '#000051',
      dark: '#534bae',
      contrastText: '#fff',
    },
    secondary: {
      light: '#330e62',
      main: '#4a148c',
      dark: '#6e43a3',
      contrastText: '#fff',
    },
    dark: {
      light: '#534bae',
      main: '#000051',
      dark: '#000051',
      contrastText: '#fff',
    },
  },
});

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        SNUhpia.org
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles(theme => ({
  body: {
    height: '100vh',
  },
  icon: {
    marginRight: theme.spacing(2),
  },
  heroContent: {
    padding: theme.spacing(16, 0, 10),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  paper: {
    display: 'flex',
    justifyContent: 'center',
    '& > *': {
      margin: theme.spacing(2),
      width: theme.spacing(32),
      height: theme.spacing(40),
    },
  },
  form: {
    width: '100%', // Fix IE 11 issue.
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  invalid: {
    color: theme.palette.secondary.main,
  },
  footer: {
    padding: theme.spacing(6),
  },
}));

export default function MainPage() {
  const userInfo = useContext(UserAuthContext);
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const history = useHistory();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formvalid, setFormvalid] = useState(true);

  const logout = () => {
    userInfo.deleteUser();
  };

  const handleMenuClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const clickImageViewer = () => {
    history.push('/studylist');
  };

  const clickAdmin = () => {
    window.location.href = 'http://snuhpia.org:10080/orthanc-admin/';
  };

  async function login_attempt() {
    if (await login(username, password)) {
      //console.log('login success');
      userInfo.setUser(username);
      history.push('/studylist');
    } else {
      //console.log('login failed');
      setFormvalid(false);
    }
  }

  const handleSubmit = event => {
    event.preventDefault();
    login_attempt();
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <ThemeProvider theme={customtheme}>
        <div className={classes.body}>
          <AppBar position="sticky" color="primary">
            <Toolbar variant="dense">
              <BlurOnIcon className={classes.icon} />
              <Typography variant="h6" color="inherit" style={{ flex: 1 }}>
                SNUHPIA
              </Typography>
              {userInfo.state.is_active && (
                <Button
                  color="inherit"
                  aria-controls="simple-menu"
                  aria-haspopup="true"
                  onClick={handleMenuClick}
                >
                  {userInfo.state.username}
                </Button>
              )}
              <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                <MenuItem onClick={clickImageViewer}>ImageViewer</MenuItem>
                <MenuItem onClick={clickAdmin}>OrthancAdmin</MenuItem>
                <MenuItem onClick={logout}>Logout</MenuItem>
              </Menu>
              {!userInfo.state.is_active && <span>Sign In Required</span>}
            </Toolbar>
          </AppBar>
          <main>
            {/* Hero unit */}
            <div className={classes.heroContent}>
              <Container maxWidth="sm">
                <Typography
                  component="h1"
                  variant="h2"
                  align="center"
                  color="textPrimary"
                  gutterBottom
                >
                  Pulmorad.
                </Typography>
                <Typography
                  variant="h5"
                  align="center"
                  color="textSecondary"
                  paragraph
                >
                  SNUH Pulmonary Imaging Assessment
                </Typography>
                <div className={classes.heroButtons}>
                  <Grid container spacing={2} justify="center">
                    <Grid item>
                      <Button variant="contained" color="primary">
                        Get Started
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button variant="outlined" color="primary">
                        GitHub
                      </Button>
                    </Grid>
                  </Grid>
                </div>
              </Container>
            </div>
            {!userInfo.state.is_active && (
              <Container component="main" maxWidth="xs">
                <div className={classes.paper}>
                  <form
                    className={classes.form}
                    method="post"
                    noValidate
                    onSubmit={handleSubmit}
                  >
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="username"
                      label="Username"
                      name="username"
                      autoComplete="username"
                      autoFocus
                      onChange={e => setUsername(e.target.value)}
                    />
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="current-password"
                      onChange={e => setPassword(e.target.value)}
                    />
                    <FormControlLabel
                      control={<Checkbox value="remember" color="primary" />}
                      label="Remember me"
                    />
                    {!formvalid && (
                      <div>
                        <span className={classes.invalid}>
                          * Username or Password is Invalid
                        </span>
                      </div>
                    )}
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="secondary"
                      className={classes.submit}
                    >
                      Sign In
                    </Button>
                    <Grid container direction="column" alignItems="center">
                      <Grid item xs>
                        <Link href="#" variant="body2">
                          Forgot password?
                        </Link>
                      </Grid>
                    </Grid>
                  </form>
                </div>
              </Container>
            )}
          </main>
          {/* Footer */}
          <footer className={classes.footer}>
            <Copyright />
          </footer>
          {/* End footer */}
        </div>
      </ThemeProvider>
    </React.Fragment>
  );
}
