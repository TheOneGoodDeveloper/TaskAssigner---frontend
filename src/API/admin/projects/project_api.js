import Instance from "@/API/Instance";

const API_URL = "/admin";

// Create a new project
export const createProject = async (projectData) => {
  try {
    const response = await Instance.post(
      `${API_URL}/createProject`,
      projectData
    );
    if (response.status === 201) {
      return response.data;
    } else {
      throw new Error("Failed to create project");
    }
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

export const fetchAllProjects = async (page, limit, searchTerm, status) => {
  try { 
    // Construct the query parameters, including status and search term
    const statusQuery = status ? `&status=${status}` : "";
    const searchQuery = searchTerm ? `&search=${searchTerm}` : "";
    // console.log(page, limit, status);
    // Make a GET request with query parameters, adding sort by createdAt in descending order
    const response = await Instance.post(
      `${API_URL}/getAllProjects/?page=${page}&limit=${limit}${statusQuery}${searchQuery}`
    );

    // Validate response
    if (response.data && response.data.data) {
      // console.log(response.data.data);
      return response.data.data; // Return the sorted project data
    } else {
      throw new Error("Invalid response structure");
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

// Fetch a single project by ID
export const fetchProjectById = async (projectId) => {
  try {
    const response = await Instance.get(`${API_URL}/${projectId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching project:", error);
    throw error;
  }
};

// Update a project by ID
export const updateProject = async (updatedData) => {
  try {
    const response = await Instance.put(
      `${API_URL}/updateProject`,
      updatedData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

// Delete a project by ID
export const deleteProject = async (projectId) => {
  try {
    const response = await Instance.delete(
      `${API_URL}/deleteProject/${projectId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

export const getAllProjectList = async () => {
  try {
    const response = await Instance.get(`${API_URL}/getAllProjectList`);
    return response.data.projects.map((item) => ({
      value: item._id, // Map 'id' to 'value'
      label: item.project_name, // Map 'name' to 'label'
    }));
  } catch (error) {
    console.error("Error fetching project list:", error);
    throw error;
  }
};

export const getProjectRelatedMilestone = async (projectId) => {
  try {
    const response = await Instance.get(
      `${API_URL}/getProjectRelatedMilestone`,
      projectId
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching project related milestone:", error);
    throw error;
  }
};

export const fetchProjectByStatus = async (status) => {
  try {
    const response = await Instance.get(`${API_URL}/projects?status=${status}`);
    console.log("asd", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching project by status:", error);
    throw error;
  }
};
