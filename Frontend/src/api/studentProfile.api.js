import axiosInstance from "./axiosInstance";

//get my profile
export const getMyProfile = ()=> {
  return axiosInstance.get("/student/profile");
};

//update my profile
export const updateMyProfile = (data)=> {
  return axiosInstance.patch("/student/profile", data);
};

//update password
export const updateMyPassword = (data)=> {
  return axiosInstance.patch("/student/profile/password", data);
};
