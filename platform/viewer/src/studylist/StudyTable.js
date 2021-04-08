import * as React from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { Button } from '@material-ui/core';

const columns = [
  { field: 'projectName', headerName: 'Project', width: 100 },
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'firstName', headerName: 'First name', width: 130 },
  { field: 'lastName', headerName: 'Last name', width: 130 },
  {
    field: 'age',
    headerName: 'Age',
    type: 'number',
    width: 90,
  },
  {
    field: 'fullName',
    headerName: 'Full name',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 160,
    valueGetter: params =>
      `${params.getValue('firstName') || ''} ${params.getValue('lastName') ||
        ''}`,
  },
];

const rows = [
  { projectName: 'SNUH', id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
  {
    projectName: 'SNUH',
    id: 2,
    lastName: 'Lannister',
    firstName: 'Cersei',
    age: 42,
  },
  {
    projectName: 'SNUH',
    id: 3,
    lastName: 'Lannister',
    firstName: 'Jaime',
    age: 45,
  },
  { projectName: 'SNUH', id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  {
    projectName: 'SNUH',
    id: 5,
    lastName: 'Targaryen',
    firstName: 'Daenerys',
    age: null,
  },
];

const StudyTable = props => {
  const { projectList, projectDict } = props;

  const logger = () => {
    console.log(projectList);
    console.log(projectDict);
  };

  const

  return (
    <div style={{ height: 400, width: '100%' }}>
      <Button onClick={logger} color="primary">
        log
      </Button>
      <DataGrid rows={rows} columns={columns} pageSize={5} checkboxSelection />
    </div>
  );
};

export default StudyTable;
