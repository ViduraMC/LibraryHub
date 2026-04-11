import axiosInstance from "./axiosInstance";

//LIBRARIAN
//get all reservations
export const getAllReservations = (params)=> {
  return axiosInstance.get('/book-reservation', {params});
}

//get reservation by ID
export const getReservationById= (id)=>{
  return axiosInstance.get(`/book-reservation/reservations/${id}`);
}

//delete a specific reservation
export const deleteReservation= (id)=>{
  return axiosInstance.delete(`/book-reservation/delete/${id}`);
};


//STUDENT AND TEACHER 
//fetch all books
export const fetchAllBooksForReservation = (params) => {
  return axiosInstance.get('/books', { params });
};

//create a reservation
export const createReservation = (data)=> {
  return axiosInstance.post('/book-reservation', data);
};

//get my reservations
export const getMyReservations = ({ tab = "active" } = {}) => {
  return axiosInstance.get("/book-reservation/my-reservations", {
    params: { tab },
  });
};

//cancel a reservation
export const cancelReservation = (id)=> {
  return axiosInstance.patch(`/book-reservation/cancel/${id}`);
};

