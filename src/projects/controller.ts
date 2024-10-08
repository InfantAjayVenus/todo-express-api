import { randomUUID } from 'crypto';
import dbContent from './db.json';
import { Project, ProjectRequest, ProjectUpdateRequest, ViewStyle } from './model';
import path from 'path';
import { writeFileSync } from 'fs';

const dbPath = path.join(__dirname, 'db.json');
let projectDB = dbContent;

export async function getProjects(creatorId: string, filters: {
    isFavourite?: boolean,
    viewStyle?: ViewStyle,
    parentId?: string,
}={}): Promise<Project[]> {
    return projectDB
        .filter(({ creator_id }) => creatorId === creator_id)
        .filter(({is_favourite}) => !filters.isFavourite || filters.isFavourite === is_favourite)
        .filter(({view_style}) => !filters.viewStyle || filters.viewStyle === view_style)
        .filter(({parent_id}) => !filters.parentId || filters.parentId === parent_id) as Project[];
}

export async function addProject(projectData: ProjectRequest): Promise<Project> {

    if (projectData?.name.length === 0 || !projectData.name) throw ("Name is a required field");

    const userProjects = projectDB.filter(({ creator_id }) => creator_id === projectData.creator_id);
    if (userProjects.some(({ name }) => name === projectData.name)) throw ("A Project with the name already exists");

    const newProject: Project = {
        id: randomUUID(),
        creator_id: projectData.creator_id,
        name: projectData.name,
        order: projectData.order,
        color: projectData.color || "",
        is_favourite: false,
        is_inbox_project: false,
        view_style: ViewStyle.list,
        parent_id: projectData.parent_id || null
    }

    projectDB.push(newProject);
    writeFileSync(dbPath, JSON.stringify(projectDB, null, 2));
    return newProject;
}

export async function getProjectById(creatorId: string, projectId: string): Promise<Project> {
    if (creatorId?.length === 0 || !creatorId) throw ("creator_id should not be null");
    if (projectId?.length === 0 || !projectId) throw ("project_id should not be null");


    const userProjects = projectDB.filter(({ creator_id }) => creatorId === creator_id);
    const projectData = userProjects.find(({id}) => id === projectId) as Project;

    if(!projectData) throw("Project Not Found");

    return projectData;
}

export async function updateProjectById(creatorId:string ,projectId: string, updatedProjectData: ProjectUpdateRequest): Promise<Project> {
    const projectData= projectDB.filter(({creator_id}) => creatorId === creator_id).find(({id}) => id === projectId);
    if(!projectData) throw(`The resource "${projectId}" could not be found`);

    const updateIndex = projectDB.findIndex(({id}) => id === projectId);

    projectDB[updateIndex] = {...projectDB[updateIndex], ...updatedProjectData} as Project;
    writeFileSync(dbPath, JSON.stringify(projectDB, null, 2));

    return projectDB[updateIndex] as Project;
}

export async function deleteProjectById(creatorId:string, projectId: string) {
    if(creatorId?.length === 0 || !creatorId) throw("Invalid Creator ID");
    if(projectId?.length === 0 || projectId) throw("Invalid Project ID");

    const updatedProjectsList = projectDB
                        .filter(({creator_id}) => creatorId === creator_id)
                        .filter(({id}) => id !== projectId);

    projectDB = updatedProjectsList;
    writeFileSync(dbPath, JSON.stringify(updatedProjectsList, null, 2));

    return updatedProjectsList.length;
}