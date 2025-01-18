
  import Instance from "../Instance";
const API_URL = "/user";

export const getAllEmployeeOwnerShip = async () => {
  try {
    const EmpOwner = await Instance.get(
      `${API_URL}/getAllUserEmpMailForProject`
    );
    // console.log(EmpOwner.data);
    return EmpOwner.data;
  } catch (err) {
    console.error("Failed to fetch employee ownerShip:", err);
    throw err;
  }
};
