import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import OHIF from '@ohif/core';
import { withRouter } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  StudyList,
  PageToolbar,
  TablePagination,
  useDebounce,
  useMedia,
} from '@ohif/ui';
import ConnectedHeader from '../connectedComponents/ConnectedHeader.js';
import * as RoutesUtil from '../routes/routesUtil';
import moment from 'moment';
import ConnectedDicomFilesUploader from '../googleCloud/ConnectedDicomFilesUploader';
import ConnectedDicomStorePicker from '../googleCloud/ConnectedDicomStorePicker';
import filesToStudies from '../lib/filesToStudies.js';

// Contexts
import UserManagerContext from '../context/UserManagerContext';
import WhiteLabelingContext from '../context/WhiteLabelingContext';
import AppContext from '../context/AppContext';

// Dropdown Button
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import NativeSelect from '@material-ui/core/NativeSelect';

import Axios from 'axios';
import Button from '@material-ui/core/Button';
import ProjectManageDialog from './ProjectManageDialog.js';

import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

const useStyles = makeStyles(theme => ({
  formControl: {
    color: 'white',
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(2),
    minWidth: 120,
  },
  selectEmpty: {
    color: 'white',
  },
  snackBar: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

const { urlUtil: UrlUtil } = OHIF.utils;

const url =
  process.env.NODE_ENV == 'production'
    ? 'https://snuhpia.org/core/'
    : 'https://snuhpia.org/core/';

function StudyListRoute(props) {
  const classes = useStyles();
  const { history, server, user, studyListFunctionsEnabled } = props;
  const [t] = useTranslation('Common');
  // ~~ STATE
  const [sort, setSort] = useState({
    fieldName: 'PatientName',
    direction: 'desc',
  });
  const [filterValues, setFilterValues] = useState({
    studyDateTo: null,
    studyDateFrom: null,
    PatientName: '',
    PatientID: '',
    AccessionNumber: '',
    StudyDate: '',
    modalities: '',
    StudyDescription: '',
    //
    patientNameOrId: '',
    accessionOrModalityOrDescription: '',
    //
    allFields: '',
  });
  const [studies, setStudies] = useState([]);
  const [searchStatus, setSearchStatus] = useState({
    isSearchingForStudies: false,
    error: null,
  });
  const [activeModalId, setActiveModalId] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [pageNumber, setPageNumber] = useState(0);
  const appContext = useContext(AppContext);
  // ~~ RESPONSIVE
  const displaySize = useMedia(
    [
      '(min-width: 1750px)',
      '(min-width: 1000px) and (max-width: 1749px)',
      '(max-width: 999px)',
    ],
    ['large', 'medium', 'small'],
    'small'
  );
  // ~~ DEBOUNCED INPUT
  const debouncedSort = useDebounce(sort, 200);
  const debouncedFilters = useDebounce(filterValues, 250);

  // Google Cloud Adapter for DICOM Store Picking
  const { appConfig = {} } = appContext;
  const isGoogleCHAIntegrationEnabled =
    !server && appConfig.enableGoogleCloudAdapter;
  if (isGoogleCHAIntegrationEnabled && activeModalId !== 'DicomStorePicker') {
    setActiveModalId('DicomStorePicker');
  }

  // Construct project list dictionary from Django response and Orthanc response using UID mapping
  const [project, setProject] = useState('INIT');
  const [projectDict, setProjectDict] = useState({});
  const constructStudyDictByProject = response => {
    let UIDProjectMapping = {};
    let studyListByProject = {};
    Axios.get(url + 'study_list/').then(studyData => {
      for (let study of studyData.data) {
        UIDProjectMapping[study.studyUID] = study.projectName;
      }
      studyListByProject['All'] = [];
      studyListByProject['Undefined'] = [];
      for (let study of response) {
        studyListByProject['All'].push(study);
        if (UIDProjectMapping.hasOwnProperty(study.studyInstanceUid)) {
          let projectName = UIDProjectMapping[study.studyInstanceUid];
          if (projectName in studyListByProject) {
            studyListByProject[projectName].push(study);
          } else {
            studyListByProject[projectName] = [study];
          }
        } else {
          studyListByProject['Undefined'].push(study);
        }
      }
    });
    setProjectDict(studyListByProject);
  };

  // projectList from Django
  const [projectList, setProjectList] = useState([]);
  const getProjectList = () => {
    return Axios.get(url + 'project_list/').then(response => {
      setProjectList(response.data);
    });
  };

  // Called when relevant state/props are updated
  // Watches filters and sort, debounced
  useEffect(
    () => {
      const fetchStudies = async () => {
        try {
          setSearchStatus({ error: null, isSearchingForStudies: true });

          const response = await getStudyList(
            server,
            debouncedFilters,
            debouncedSort,
            rowsPerPage,
            pageNumber,
            displaySize
          );
          getProjectList();
          constructStudyDictByProject(response);
          setStudies(response);
          setSearchStatus({ error: null, isSearchingForStudies: false });
        } catch (error) {
          console.warn(error);
          setSearchStatus({ error: true, isFetching: false });
        }
      };

      if (server) {
        fetchStudies();
      }
    },
    // TODO: Can we update studies directly?
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      debouncedFilters,
      debouncedSort,
      rowsPerPage,
      pageNumber,
      displaySize,
      server,
    ]
  );

  // TODO: Update Server
  // if (this.props.server !== prevProps.server) {
  //   this.setState({
  //     modalComponentId: null,
  //     searchData: null,
  //     studies: null,
  //   });
  // }

  const handleProjectChange = event => {
    event.preventDefault();
    setProject(event.target.value);
  };

  const [openSnackBar, setSnackBar] = useState(false);

  const handleSnackBarClose = event => {
    event.stopPropagation();
    setSnackBar(false);
  };

  const selectProject = () => {
    if (project != 'INIT') {
      if (!(project in projectDict)) {
        setSnackBar(true);
      } else {
        setStudies(projectDict[project]);
      }
    }
  };

  useEffect(() => {
    selectProject(), [handleProjectChange];
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const openDialog = () => {
    setDialogOpen(true);
  };
  const closeDialog = () => {
    setDialogOpen(false);
  };

  const onDrop = async acceptedFiles => {
    try {
      const studiesFromFiles = await filesToStudies(acceptedFiles);
      setStudies(studiesFromFiles);
    } catch (error) {
      setSearchStatus({ isSearchingForStudies: false, error });
    }
  };

  if (searchStatus.error) {
    return <div>Error: {JSON.stringify(searchStatus.error)}</div>;
  } else if (studies === [] && !activeModalId) {
    return <div>Loading...</div>;
  }

  let healthCareApiButtons = null;
  let healthCareApiWindows = null;

  if (appConfig.enableGoogleCloudAdapter) {
    const isModalOpen = activeModalId === 'DicomStorePicker';
    updateURL(isModalOpen, appConfig, server, history);

    healthCareApiWindows = (
      <ConnectedDicomStorePicker
        isOpen={activeModalId === 'DicomStorePicker'}
        onClose={() => setActiveModalId(null)}
      />
    );

    healthCareApiButtons = (
      <div
        className="form-inline btn-group pull-right"
        style={{ padding: '20px' }}
      >
        <button
          className="btn btn-primary"
          onClick={() => setActiveModalId('DicomStorePicker')}
        >
          {t('Change DICOM Store')}
        </button>
      </div>
    );
  }

  function handleSort(fieldName) {
    let sortFieldName = fieldName;
    let sortDirection = 'asc';

    if (fieldName === sort.fieldName) {
      if (sort.direction === 'asc') {
        sortDirection = 'desc';
      } else {
        sortFieldName = null;
        sortDirection = null;
      }
    }

    setSort({
      fieldName: sortFieldName,
      direction: sortDirection,
    });
  }

  function handleFilterChange(fieldName, value) {
    setFilterValues(state => {
      return {
        ...state,
        [fieldName]: value,
      };
    });
  }

  return (
    <>
      {studyListFunctionsEnabled ? (
        <ConnectedDicomFilesUploader
          isOpen={activeModalId === 'DicomFilesUploader'}
          onClose={() => setActiveModalId(null)}
        />
      ) : null}
      {healthCareApiWindows}
      <WhiteLabelingContext.Consumer>
        {whiteLabeling => (
          <UserManagerContext.Consumer>
            {userManager => (
              <ConnectedHeader
                useLargeLogo={true}
                user={user}
                userManager={userManager}
              >
                {whiteLabeling &&
                  whiteLabeling.createLogoComponentFn &&
                  whiteLabeling.createLogoComponentFn(React)}
              </ConnectedHeader>
            )}
          </UserManagerContext.Consumer>
        )}
      </WhiteLabelingContext.Consumer>
      <div className="study-list-header">
        <div className="header" style={{ display: 'flex' }}>
          <h1
            style={{
              fontWeight: 300,
              fontSize: '22px',
              paddingTop: '0.5vh',
              paddingLeft: '0.5vh',
            }}
          >
            StudyList :
          </h1>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="age-native-helper" style={{ color: 'white' }}>
              ProjectList
            </InputLabel>
            <NativeSelect
              value={project}
              onChange={handleProjectChange}
              inputProps={{
                name: 'age',
                id: 'age-native-helper',
              }}
              style={{ color: 'white' }}
            >
              <option
                key={'All'}
                aria-label="None"
                style={{ backgroundColor: '#2c363f' }}
              >
                All
              </option>
              {projectList.map(project => (
                <option
                  key={project.projectName}
                  style={{ backgroundColor: '#2c363f' }}
                >
                  {project.projectName}
                </option>
              ))}
            </NativeSelect>
            <FormHelperText style={{ color: 'white' }}>
              Select Project
            </FormHelperText>
          </FormControl>
        </div>
        <div className="actions">
          {studyListFunctionsEnabled && healthCareApiButtons}
          {studyListFunctionsEnabled && (
            <PageToolbar
              onImport={() => setActiveModalId('DicomFilesUploader')}
            />
          )}
          <Button
            variant="contained"
            style={{ margin: '2vh' }}
            onClick={openDialog}
          >
            <span>Manage Project</span>
            <ProjectManageDialog
              open={dialogOpen}
              onClose={closeDialog}
              projectList={projectList}
              projectDict={projectDict}
              setProjectDict={setProjectDict}
              getProject={getProjectList}
              constructStudyDictByProject={constructStudyDictByProject}
            />
          </Button>
          <span className="study-count">{studies.length}</span>
        </div>
      </div>

      <div className="table-head-background" />
      <div className="study-list-container">
        {/* STUDY LIST OR DROP ZONE? */}
        <StudyList
          isLoading={searchStatus.isSearchingForStudies}
          hasError={searchStatus.error === true}
          // Rows
          studies={studies}
          onSelectItem={studyInstanceUID => {
            const viewerPath = RoutesUtil.parseViewerPath(appConfig, server, {
              studyInstanceUIDs: studyInstanceUID,
            });
            history.push(viewerPath);
          }}
          // Table Header
          sort={sort}
          onSort={handleSort}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          studyListDateFilterNumDays={appConfig.studyListDateFilterNumDays}
          displaySize={displaySize}
        />
        {/* PAGINATION FOOTER */}
        <TablePagination
          currentPage={pageNumber}
          nextPageFunc={() => setPageNumber(pageNumber + 1)}
          prevPageFunc={() => setPageNumber(pageNumber - 1)}
          onRowsPerPageChange={Rows => setRowsPerPage(Rows)}
          rowsPerPage={rowsPerPage}
          recordCount={studies.length}
        />
      </div>
      <div className={classes.snackBar}>
        <Snackbar
          open={openSnackBar}
          autoHideDuration={6000}
          onClose={handleSnackBarClose}
        >
          <Alert severity="warning" onClose={handleSnackBarClose}>
            The project you select is empty!
          </Alert>
        </Snackbar>
      </div>
    </>
  );
}

StudyListRoute.propTypes = {
  filters: PropTypes.object,
  PatientID: PropTypes.string,
  server: PropTypes.object,
  user: PropTypes.object,
  history: PropTypes.object,
  studyListFunctionsEnabled: PropTypes.bool,
};

StudyListRoute.defaultProps = {
  studyListFunctionsEnabled: true,
};

function updateURL(isModalOpen, appConfig, server, history) {
  if (isModalOpen) {
    return;
  }

  const listPath = RoutesUtil.parseStudyListPath(appConfig, server);

  if (UrlUtil.paramString.isValidPath(listPath)) {
    const { location = {} } = history;
    if (location.pathname !== listPath) {
      history.replace(listPath);
    }
  }
}

/**
 * Not ideal, but we use displaySize to determine how the filters should be used
 * to build the collection of promises we need to fetch a result set.
 *
 * @param {*} server
 * @param {*} filters
 * @param {object} sort
 * @param {string} sort.fieldName - field to sort by
 * @param {string} sort.direction - direction to sort
 * @param {number} rowsPerPage - Number of results to return
 * @param {number} pageNumber - Used to determine results offset
 * @param {string} displaySize - small, medium, large
 * @returns
 */
async function getStudyList(
  server,
  filters,
  sort,
  rowsPerPage,
  pageNumber,
  displaySize
) {
  const {
    allFields,
    patientNameOrId,
    accessionOrModalityOrDescription,
  } = filters;
  const sortFieldName = sort.fieldName || 'PatientName';
  const sortDirection = sort.direction || 'desc';
  const studyDateFrom =
    filters.studyDateFrom ||
    moment()
      .subtract(25000, 'days')
      .toDate();
  const studyDateTo = filters.studyDateTo || new Date();

  const mappedFilters = {
    PatientID: filters.PatientID,
    PatientName: filters.PatientName,
    AccessionNumber: filters.AccessionNumber,
    StudyDescription: filters.StudyDescription,
    ModalitiesInStudy: filters.modalities,
    // NEVER CHANGE
    studyDateFrom,
    studyDateTo,
    limit: rowsPerPage,
    offset: pageNumber * rowsPerPage,
    fuzzymatching: server.supportsFuzzyMatching === true,
  };

  const studies = await _fetchStudies(server, mappedFilters, displaySize, {
    allFields,
    patientNameOrId,
    accessionOrModalityOrDescription,
  });

  // Only the fields we use
  const mappedStudies = studies.map(study => {
    const PatientName =
      typeof study.PatientName === 'string' ? study.PatientName : undefined;

    return {
      AccessionNumber: study.AccessionNumber, // "1"
      modalities: study.modalities, // "SEG\\MR"  ​​
      // numberOfStudyRelatedInstances: "3"
      // numberOfStudyRelatedSeries: "3"
      // PatientBirthdate: undefined
      PatientID: study.PatientID, // "NOID"
      PatientName, // "NAME^NONE"
      // PatientSex: "M"
      // referringPhysicianName: undefined
      StudyDate: study.StudyDate, // "Jun 28, 2002"
      StudyDescription: study.StudyDescription, // "BRAIN"
      // studyId: "No Study ID"
      StudyInstanceUID: study.StudyInstanceUID, // "1.3.6.1.4.1.5962.99.1.3814087073.479799962.1489872804257.3.0"
      // StudyTime: "160956.0"
    };
  });

  // For our smaller displays, map our field name to a single
  // field we can actually sort by.
  const sortFieldNameMapping = {
    allFields: 'PatientName',
    patientNameOrId: 'PatientName',
    accessionOrModalityOrDescription: 'modalities',
  };
  const mappedSortFieldName =
    sortFieldNameMapping[sortFieldName] || sortFieldName;

  const sortedStudies = _sortStudies(
    mappedStudies,
    mappedSortFieldName,
    sortDirection
  );

  // Because we've merged multiple requests, we may have more than
  // our Rows per page. Let's `take` that number from our sorted array.
  // This "might" cause paging issues.
  const numToTake =
    sortedStudies.length < rowsPerPage ? sortedStudies.length : rowsPerPage;
  const result = sortedStudies.slice(0, numToTake);

  return result;
}

/**
 *
 *
 * @param {object[]} studies - Array of studies to sort
 * @param {string} studies.StudyDate - Date in 'MMM DD, YYYY' format
 * @param {string} field - name of properties on study to sort by
 * @param {string} order - 'asc' or 'desc'
 * @returns
 */
function _sortStudies(studies, field, order) {
  // Make sure our StudyDate is in a valid format and create copy of studies array
  const sortedStudies = studies.map(study => {
    if (!moment(study.StudyDate, 'MMM DD, YYYY', true).isValid()) {
      study.StudyDate = moment(study.StudyDate, 'YYYYMMDD').format(
        'MMM DD, YYYY'
      );
    }
    return study;
  });

  // Sort by field
  sortedStudies.sort(function(a, b) {
    let fieldA = a[field];
    let fieldB = b[field];
    if (field === 'StudyDate') {
      fieldA = moment(fieldA).toISOString();
      fieldB = moment(fieldB).toISOString();
    }

    // Order
    if (order === 'desc') {
      if (fieldA < fieldB) {
        return -1;
      }
      if (fieldA > fieldB) {
        return 1;
      }
      return 0;
    } else {
      if (fieldA > fieldB) {
        return -1;
      }
      if (fieldA < fieldB) {
        return 1;
      }
      return 0;
    }
  });

  return sortedStudies;
}

/**
 * We're forced to do this because DICOMWeb does not support "AND|OR" searches
 * across multiple fields. This allows us to make multiple requests, remove
 * duplicates, and return the result set as if it were supported
 *
 * @param {object} server
 * @param {Object} filters
 * @param {string} displaySize - small, medium, or large
 * @param {string} multi.allFields
 * @param {string} multi.patientNameOrId
 * @param {string} multi.accessionOrModalityOrDescription
 */
async function _fetchStudies(
  server,
  filters,
  displaySize,
  { allFields, patientNameOrId, accessionOrModalityOrDescription }
) {
  let queryFiltersArray = [filters];

  if (displaySize === 'small') {
    const firstSet = _getQueryFiltersForValue(
      filters,
      [
        'PatientID',
        'PatientName',
        'AccessionNumber',
        'StudyDescription',
        'ModalitiesInStudy',
      ],
      allFields
    );

    if (firstSet.length) {
      queryFiltersArray = firstSet;
    }
  } else if (displaySize === 'medium') {
    const firstSet = _getQueryFiltersForValue(
      filters,
      ['PatientID', 'PatientName'],
      patientNameOrId
    );

    const secondSet = _getQueryFiltersForValue(
      filters,
      ['AccessionNumber', 'StudyDescription', 'ModalitiesInStudy'],
      accessionOrModalityOrDescription
    );

    if (firstSet.length || secondSet.length) {
      queryFiltersArray = firstSet.concat(secondSet);
    }
  }

  const queryPromises = [];

  queryFiltersArray.forEach(filter => {
    const searchStudiesPromise = OHIF.studies.searchStudies(server, filter);
    queryPromises.push(searchStudiesPromise);
  });

  const lotsOfStudies = await Promise.all(queryPromises);
  const studies = [];

  // Flatten and dedupe
  lotsOfStudies.forEach(arrayOfStudies => {
    if (arrayOfStudies) {
      arrayOfStudies.forEach(study => {
        if (!studies.some(s => s.StudyInstanceUID === study.StudyInstanceUID)) {
          studies.push(study);
        }
      });
    }
  });

  return studies;
}

/**
 *
 *
 * @param {*} filters
 * @param {*} fields - Array of string fields
 * @param {*} value
 */
function _getQueryFiltersForValue(filters, fields, value) {
  const queryFilters = [];

  if (value === '' || !value) {
    return queryFilters;
  }

  fields.forEach(field => {
    const filter = Object.assign(
      {
        PatientID: '',
        PatientName: '',
        AccessionNumber: '',
        StudyDescription: '',
        ModalitiesInStudy: '',
      },
      filters
    );

    filter[field] = value;
    queryFilters.push(filter);
  });

  return queryFilters;
}

export default withRouter(StudyListRoute);
