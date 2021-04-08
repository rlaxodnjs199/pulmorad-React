import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import axios from 'axios';
import StudyTable from './StudyTable';
import { mutate } from 'swr';
import {
  parseProjectList,
  parseStudiesByProject,
} from './projectManager/projectManager';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

const ProjectManageDialog = props => {
  const { open, onClose, projects } = props;
  const [dialogs, setDialogs] = useState({
    AddToProjectDialog: false,
    CreateNewProjectDialog: false,
  });
  const classes = useStyles();

  const handleClose = event => {
    event.stopPropagation();
    onClose();
  };

  return (
    <Dialog
      fullWidth
      maxWidth={'md'}
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title" className={classes.root}>
        <span>Study Table</span>
        <Button
          color="primary"
          size="small"
          onClick={() => {
            setDialogs({ ...dialogs, AddToProjectDialog: true });
          }}
          style={{ marginLeft: '2vh' }}
        >
          Add To Project
        </Button>
        <AddToProjectDialog
          dialog={dialogs.AddToProjectDialog}
          closeDialog={() => {
            setDialogs({ ...dialogs, AddToProjectDialog: false });
          }}
        />
        <Button
          color="primary"
          size="small"
          onClick={() => {
            setDialogs({ ...dialogs, CreateNewProjectDialog: true });
          }}
          style={{ marginLeft: '2vh' }}
        >
          Create New Project
        </Button>
        <CreateNewProjectDialog
          dialog={dialogs.CreateNewProjectDialog}
          closeDialog={() => {
            setDialogs({ ...dialogs, CreateNewProjectDialog: false });
          }}
        />
      </DialogTitle>
      <DialogContent dividers>
        <StudyTable
          projectList={parseProjectList(projects)}
          projectDict={parseStudiesByProject(projects)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProjectManageDialog;

const AddToProjectDialog = props => {
  const { dialog, closeDialog } = props;
  const [title, setTitle] = useState('');

  const FastAPI_URL =
    process.env.NODE_ENV == 'production'
      ? process.env.PROD_FastAPI_URL
      : process.env.DEV_FastAPI_URL;

  const createNewProject = props => {
    return axios
      .post(FastAPI_URL + '/projects/', { title: title })
      .then(response => {
        //console.log('Add Project Success');
        mutate(FastAPI_URL + '/projects/');
        closeDialog();
      });
  };
  const updateTextField = event => {
    setTitle(event.target.value);
  };

  return (
    <Dialog
      open={dialog}
      onClose={closeDialog}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Add to Project</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please enter new project name you want to add.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="project title"
          label="Project Title"
          variant="filled"
          fullWidth
          onChange={updateTextField}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={createNewProject} color="primary">
          Add
        </Button>
        <Button onClick={closeDialog} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CreateNewProjectDialog = props => {
  const { dialog, closeDialog } = props;
  const [title, setTitle] = useState('');

  const FastAPI_URL =
    process.env.NODE_ENV == 'production'
      ? process.env.PROD_FastAPI_URL
      : process.env.DEV_FastAPI_URL;

  const createNewProject = props => {
    return axios
      .post(FastAPI_URL + '/projects/', { title: title })
      .then(response => {
        //console.log('Add Project Success');
        mutate(FastAPI_URL + '/projects/');
        closeDialog();
      });
  };
  const updateTextField = event => {
    setTitle(event.target.value);
  };

  return (
    <Dialog
      open={dialog}
      onClose={closeDialog}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Create New Project</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please enter new project name you want to add.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="project title"
          label="Project Title"
          variant="filled"
          fullWidth
          onChange={updateTextField}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={createNewProject} color="primary">
          Add
        </Button>
        <Button onClick={closeDialog} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
