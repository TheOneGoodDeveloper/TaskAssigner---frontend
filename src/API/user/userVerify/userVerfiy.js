
  import Instance from "@/API/Instance";
const API_URL = "/user";

export const getEmpMails = async () => {
  try {
    const response = await Instance.get(`${API_URL}/getEmpMails`);
    return response.data.data.map((item) => ({
      value: item._id,
      label: item.name,
    }));
  } catch (error) {
    console.error("getEmpMails", error);
    throw error;
  }
};
