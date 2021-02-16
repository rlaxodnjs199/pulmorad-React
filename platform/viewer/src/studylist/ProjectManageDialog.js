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
import Axios from 'axios';
import StudyTable from './StudyTable';

ProjectManageDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  projectList: PropTypes.array.isRequired,
  projectDict: PropTypes.object.isRequired,
  setProjectDict: PropTypes.func.isRequired,
  getProject: PropTypes.func.isRequired,
  constructStudyDictByProject: PropTypes.func.isRequired,
};

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

const url =
  process.env.NODE_ENV == 'production'
    ? 'http://ec2-3-36-95-176.ap-northeast-2.compute.amazonaws.com:8000/'
    : 'http://ec2-3-36-95-176.ap-northeast-2.compute.amazonaws.com:8000/';

function ProjectManageDialog(props) {
  const {
    open,
    onClose,
    projectList,
    projectDict,
    setProjectDict,
    getProject,
    constructStudyDictByProject,
  } = props;
  const [addNewDialog, setAddNewDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const classes = useStyles();
  const handleClose = event => {
    event.stopPropagation();
    onClose();
  };

  //const csrftoken = Cookies.get('csrftoken');
  const createProject = () => {
    return Axios.post(url + 'OHIF_project/', {
      projectName: projectName,
    }).then(response => {
      getProject();
      closeAddNewDialog();
    });
    //resync list by update projectList
  };

  //const deleteProject = projectID => {
  //  return Axios.delete(
  //    'http://localhost:8000/api/v1/OHIF_project/${projectID}/',
  //    projectID
  //  ).then(response => {
  //    console.log(response.statusText);
  //  });
  //};

  //const updateProject = projectName => {
  //  return Axios.put();
  //};

  const openAddNewDialog = () => {
    setAddNewDialog(true);
  };

  const closeAddNewDialog = () => {
    setAddNewDialog(false);
  };

  const updateTextField = event => {
    setProjectName(event.target.value);
  };

  return (
    <Dialog
      maxWidth={'lg'}
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title" className={classes.root}>
        <span>Manage Project</span>
        <Button
          color="primary"
          size="small"
          onClick={openAddNewDialog}
          style={{ marginLeft: '2vh' }}
        >
          Add New Project
        </Button>
        <Dialog
          open={addNewDialog}
          onClose={closeAddNewDialog}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Add New Project</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please enter new project name you want to add.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="project"
              label="Project Name"
              variant="filled"
              fullWidth
              onChange={updateTextField}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={createProject} color="primary">
              Add
            </Button>
            <Button onClick={closeAddNewDialog} color="primary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </DialogTitle>
      <DialogContent dividers>
        <StudyTable
          projectList={projectList}
          projectDict={projectDict}
          setProjectDict={setProjectDict}
          constructStudyDictByProject={constructStudyDictByProject}
        />
      </DialogContent>
    </Dialog>
  );
}

export default ProjectManageDialog;
