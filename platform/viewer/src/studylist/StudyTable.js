import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import Axios from 'axios';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import FolderOpenOutlinedIcon from '@material-ui/icons/FolderOpenOutlined';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

const headCells = [
  {
    id: 'pName',
    numeric: false,
    disablePadding: true,
    label: 'Patient Name',
  },
  {
    id: 'pID',
    numeric: true,
    disablePadding: false,
    label: 'Patient ID',
  },
  {
    id: 'studyDate',
    numeric: true,
    disablePadding: false,
    label: 'Study Date',
  },
  { id: 'modal', numeric: true, disablePadding: false, label: 'Modalities' },
  {
    id: 'UID',
    numeric: true,
    disablePadding: false,
    label: 'StudyInstaceUID',
  },
];

function EnhancedTableHead(props) {
  const {
    classes,
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = property => event => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all desserts' }}
          />
        </TableCell>
        {headCells.map(headCell => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  selectMenu: {
    marginLeft: theme.spacing(3),
    minWidth: 120,
  },
}));

const EnhancedTableToolbar = props => {
  const classes = useToolbarStyles();
  const {
    projectList,
    projectDict,
    currentProject,
    setCurrentProject,
    numSelected,
    addStudy,
    addToProjectDialog,
    setAddToProjectDialog,
  } = props;

  const openAddToProjectDialog = () => {
    setAddToProjectDialog(true);
  };

  const closeAddToProjectDialog = event => {
    event.stopPropagation();
    setAddToProjectDialog(false);
  };

  const handleChange = event => {
    setCurrentProject(event.target.value);
  };

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography
          className={classes.title}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          className={classes.title}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          <span>Study List</span>
          <FormControl variant="outlined" className={classes.selectMenu}>
            <InputLabel id="demo-simple-select-outlined-label">
              Project
            </InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              value={currentProject}
              onChange={handleChange}
              label="Project"
            >
              {Object.keys(projectDict).map((project, index) => {
                return (
                  <MenuItem key={index} value={project}>
                    {project}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Add to project">
          <IconButton
            aria-label="Add to project"
            onClick={openAddToProjectDialog}
          >
            <AddCircleOutlineIcon />
            <Dialog
              open={addToProjectDialog}
              onClose={closeAddToProjectDialog}
              aria-labelledby="form-dialog-title"
            >
              <DialogTitle id="form-dialog-title">Select Project</DialogTitle>
              <DialogContent>
                <div className={classes.list}>
                  <List component="nav" aria-label="project list">
                    {projectList.map((value, index) => {
                      return (
                        <ListItem
                          key={index}
                          button
                          onClick={addStudy(value.projectName)}
                        >
                          <ListItemIcon>
                            <FolderOpenOutlinedIcon />
                          </ListItemIcon>
                          <ListItemText primary={value.projectName} />
                        </ListItem>
                      );
                    })}
                  </List>
                </div>
              </DialogContent>
              <DialogActions>
                <Button onClick={addStudy} color="primary">
                  Add
                </Button>
                <Button onClick={closeAddToProjectDialog} color="primary">
                  Cancel
                </Button>
              </DialogActions>
            </Dialog>
          </IconButton>
        </Tooltip>
      ) : (
        <div></div>
      )}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  projectList: PropTypes.array.isRequired,
  projectDict: PropTypes.object.isRequired,
  currentProject: PropTypes.string.isRequired,
  setCurrentProject: PropTypes.func.isRequired,
  numSelected: PropTypes.number.isRequired,
  addStudy: PropTypes.func.isRequired,
  addToProjectDialog: PropTypes.bool.isRequired,
  setAddToProjectDialog: PropTypes.func.isRequired,
};

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

StudyTable.propTypes = {
  projectList: PropTypes.array.isRequired,
  projectDict: PropTypes.object.isRequired,
  setProjectDict: PropTypes.func.isRequired,
  constructStudyDictByProject: PropTypes.func.isRequired,
};

export default function StudyTable(props) {
  const {
    projectList,
    projectDict,
    setProjectDict,
    constructStudyDictByProject,
  } = props;
  const classes = useStyles();
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [dataPerPage, setdataPerPage] = React.useState(5);
  const [currentProject, setCurrentProject] = React.useState('All');
  const [addToProjectDialog, setAddToProjectDialog] = React.useState(false);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const data = projectDict[currentProject];

  const handleSelectAllClick = event => {
    if (event.target.checked) {
      const newSelecteds = data.map(n => n.studyInstanceUid);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangedataPerPage = event => {
    setdataPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = event => {
    setDense(event.target.checked);
  };

  const isSelected = name => selected.indexOf(name) !== -1;

  const emptydata =
    dataPerPage - Math.min(dataPerPage, data.length - page * dataPerPage);

  const addStudy = projectName => () => {
    selected.forEach(study =>
      Axios.post('https://snuhpia.org/core/study_list/', {
        studyUID: study,
        projectName: projectName,
      }).then(
        response => {
          setSnackbarMessage('Success: Adding study to the project succeeded');
          setSnackBar(true);
        },
        error => {
          setSnackbarMessage('Error: Adding study to the project failed');
          setSnackBar(true);
        }
      )
    );
  };

  const [openSnackBar, setSnackBar] = useState(false);

  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSnackBarClose = event => {
    event.stopPropagation();
    setSnackBar(false);
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar
          projectList={projectList}
          projectDict={projectDict}
          currentProject={currentProject}
          setCurrentProject={setCurrentProject}
          numSelected={selected.length}
          addStudy={addStudy}
          addToProjectDialog={addToProjectDialog}
          setAddToProjectDialog={setAddToProjectDialog}
        />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={data.length}
            />
            <TableBody>
              {stableSort(data, getComparator(order, orderBy))
                .slice(page * dataPerPage, page * dataPerPage + dataPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.studyInstanceUid);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={event =>
                        handleClick(event, row.studyInstanceUid)
                      }
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.patientName}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        {row.patientName}
                      </TableCell>
                      <TableCell align="right">{row.patientId}</TableCell>
                      <TableCell align="right">{row.studyDate}</TableCell>
                      <TableCell align="right">{row.modalities}</TableCell>
                      <TableCell align="right">
                        {row.studyInstanceUid}
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptydata > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptydata }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
              <Snackbar
                open={openSnackBar}
                autoHideDuration={6000}
                onClose={handleSnackBarClose}
              >
                <Alert severity="warning" onClose={handleSnackBarClose}>
                  {snackbarMessage}
                </Alert>
              </Snackbar>
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.length}
          rowsPerPage={dataPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangedataPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      />
    </div>
  );
}
