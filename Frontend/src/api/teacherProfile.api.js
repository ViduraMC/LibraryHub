import axiosInstance from "./axiosInstance";

//get profile
export const getMyProfile = async ()=> {
  return axiosInstance.get("/teacher/profile");
};

//update profile
export const updateMyProfile= async (data)=> {
  return axiosInstance.patch("/teacher/profile", data);
};

//update password
export const updateMyPassword = async (data)=> {
  return axiosInstance.patch("/teacher/profile/password", data);
};
