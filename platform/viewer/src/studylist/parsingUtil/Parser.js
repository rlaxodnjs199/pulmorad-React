export const parseStudiesByProject = (dataFromDB, studiesFromDicomServer) => {
  const studiesFromDB = dataFromDB[1];
  console.log(dataFromDB);
  console.log(studiesFromDB);
  let project_study_dict = {};
  let all_studies = [];
  let unassigned_studies = [];

  if (studiesFromDicomServer) {
    studiesFromDicomServer.forEach(study => {
      all_studies.push(study);
      const studyInstanceUID = study.StudyInstanceUID;
      if (studyInstanceUID in studiesFromDB) {
        const projectTitle = studiesFromDB[studyInstanceUID];
        if (project_study_dict[projectTitle]) {
          project_study_dict[projectTitle].push(study);
        } else {
          project_study_dict[projectTitle] = [study];
        }
      } else {
        unassigned_studies.push(study);
      }
      // console.log(study.StudyInstanceUID);
    });
  }

  project_study_dict['All'] = all_studies;
  project_study_dict['Unassigned'] = unassigned_studies;

  return project_study_dict;
};

export const parseProjectList = dataFromDB => {
  const projectList = dataFromDB[0];
  return projectList.map(project => {
    return project.title;
  });
};
