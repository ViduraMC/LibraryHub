import axiosInstance from "./axiosInstance";

//LIBRARIAN
//get all reservations
export const getAllReservations = ()=> {
  axiosInstance.get('/book-reservation');
}

//get reservation by ID
export const getReservationById= (id)=>{
  axiosInstance.get(`/book-reservation/reservations/${id}`);
}

//delete a specific reservation
export const deleteReservation= (id)=>{
  axiosInstance.delete(`book-reservation/delete/${id}`);
}


//STUDENT AND TEACHER 
//create a reservation
export const createReservation = (data)=> {
  axiosInstance.post('/book-reservation', data);
} 

//get my reservations
export const getMyReservations = ()=> {
  axiosInstance.get('/book-reservation/my-reservations');
}

//cancel a reservation
export const cancelReservation = (id)=> {
  axiosInstance.patch(`/book-reservation/cancel/${id}`);
}

