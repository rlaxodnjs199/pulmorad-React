export const parseStudiesByProject = (projects, studiesFromOrthanc) => {
  let Project_Studies_Dict = {};
  Project_Studies_Dict['All'] = studiesFromOrthanc;
  projects.map(project => {
    Project_Studies_Dict[project.title] = project.studies;
  });
  return Project_Studies_Dict;
};

export const parseProjectList = projects => {
  return projects.map(project => {
    return project.title;
  });
};

export const ProjectDialog = () => {};
