import React, { useEffect, useState } from "react";
import Navbar from "./llnavbar";
import "./../css/llp.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "react-modal";

Modal.setAppElement("#root"); // Set the app element for accessibility

const AddRoom = () => {
  const [userData, setUserData] = useState({});
  const [newRooms, setNewRooms] = useState({
    type: "",
    email: "",
    photos: [],
    address: "",
    city: "",
    landlord: "",
    status: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userId = localStorage.getItem("userId");
  const email = localStorage.getItem("userEmail");
  let navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `api/user/profile/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUserData(response.data.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId]);

  const addNewRoom = async (e) => {
    e.preventDefault();
    try {
      if (!newRooms.type || !newRooms.address || !newRooms.city) {
        alert("Please fill out all required fields.");
        return;
      }

      const formData = new FormData();
      formData.append("type", newRooms.type);
      formData.append("email", email);
      formData.append("address", newRooms.address);
      formData.append("city", newRooms.city);
      formData.append("landlord", newRooms.landlord);
      formData.append("status", newRooms.status);
      newRooms.photos.forEach((photo) => {
        formData.append("photos", photo);
      });

      const response = await axios.post(
        `api/room/user/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Room Added Successfully :)");
      navigate("/updateRoom");
    } catch (error) {
      console.error("Error adding room:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  const onChange = (e) => {
    if (e.target.name === "photos") {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(
        (file) => file.type === "image/png" || file.type === "image/jpeg"
      );
      if (validFiles.length !== files.length) {
        alert("Only PNG and JPG images are allowed.");
      }
      setNewRooms({ ...newRooms, [e.target.name]: validFiles });
    } else {
      setNewRooms({ ...newRooms, [e.target.name]: e.target.value });
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{textAlign:"center"}}>
        <button onClick={() => setIsModalOpen(true)} className="addRoom_btn" >
          Open Input Box for Add the room
        </button>
      </div>

      <Modal style={{backgroundColor:"blue"}} isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)}>
        <div>
          <form style={{
            backgroundColor:"pink",
            display: "flex",
            flexDirection: "column",
            justifyContent:"center",
            alignItems: "center",
            border:"2px solid red"
          }} 
          onSubmit={addNewRoom}>
            <h1>Enter Room Details</h1>

            <select
              name="type"
              onChange={onChange}
              value={newRooms.type}
              required
              
            >
              <option value="">Select Room Type</option>
              <option value="sharing">sharing</option>
              <option value="single">single</option>
              <option value="apartment">apartment</option>
            </select>

            <input
             style={{width:"300px",margin:"10px"}}
              type="text"
              name="email"
              placeholder="Your Email"
              onChange={onChange}
              value={newRooms.email || userData.email}
              required
            />

            <input
             style={{width:"300px",margin:"10px"}}
              type="file"
              name="photos"
              onChange={onChange}
              multiple
              accept="image/png, image/jpeg"
            />

            <input
             style={{width:"300px",margin:"10px"}}
              type="text"
              name="address"
              placeholder="Address" 
              onChange={onChange}
              value={newRooms.address}
              required
            />

            <input
             style={{width:"300px",margin:"10px"}}
              type="text"
              name="city"
              placeholder="City"
              onChange={onChange}
              value={newRooms.city}
              required
            />

            <input
             style={{width:"300px",margin:"10px"}}
              type="text"
              name="landlord"
              onChange={onChange}
              value={userId}
              readOnly
            />

            <select
              name="status"
              onChange={onChange}
              value={newRooms.status}
              required
            >
              <option value="">Select Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
            </select>
            <button style={{backgroundColor:"#f20674", color:"white",padding:"5px 20px",marginTop:"25px", margin:"5px", borderRadius:"10px",border:"none"}} type="submit">Add Room</button>
            <button style={{backgroundColor:"#f20674", color:"white",padding:"5px 20px", margin:"5px", borderRadius:"10px",border:"none"}} type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default AddRoom;
