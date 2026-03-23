import React, { useState, useEffect } from "react";
import Navbar from "../../Pages/navbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "react-modal";

const ProfilePage = () => {
  const [selectedOption, setSelectedOption] = useState("profile");
  const [userData, setUserData] = useState(null);
  const [tenantRoom, setTenantRoom] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    aadharNumber: "",
  });
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const userEmail = localStorage.getItem("userEmail");


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
    const fetchRoomData = async () => {
      try {
        const response = await axios.get(
          `api/tenant/profile/room/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setTenantRoom(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleFileChange = (event) => {
    setProfilePhoto(event.target.files[0]);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!profilePhoto) {
      alert("Please select a profile photo.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("profilePhoto", profilePhoto);

      const response = await axios.post(
        `api/user/profile/photo/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Profile photo uploaded successfully");
      setUserData((prevUserData) => ({
        ...prevUserData,
        profilePhoto: response.data.data?.filePath,
      }));
    } catch (error) {
      console.error("Error uploading profile photo:", error);
    }
  };

  const handleUpdateChange = (event) => {
    const { name, value } = event.target;
    setUpdatedData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.put(
        `api/user/profile/${userId}`,
        updatedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("User details updated successfully");
      setIsModalOpen(false);
      setUserData(response.data.data);
    } catch (error) {
      console.error("Error updating user details:", error);
    }
  };

  const renderContent = () => {
    switch (selectedOption) {
      case "PersonalDetails":
        return (
          <div className="renderbox">
            <div className="second-heading">
              <h1>Your Personal Details</h1>
            </div>
            <div className="second-content">
              <p className="label">Name:</p>
              <p className="InputField">{userData?.name}</p>

              <p className="label">Email Id:</p>
              <p className="InputField">{userData?.email}</p>

              <p className="label">Contact Details:</p>
              <p className="InputField"> {userData?.contactNumber}</p>

              <p className="label">Aadhar Number:</p>
              <p className="InputField"> {userData?.aadharNumber}</p>
            </div>
          </div>
        );

      case "RoomDetails":
        return (
          <div className="renderbox">
            <div className="second-heading">
              <h1>Your Room Details</h1>
            </div>
            <div className="second-content">
              {tenantRoom ? (
                <>
                  <p className="label">Room Type:</p>
                  <p className="InputField">{tenantRoom.type}</p>

                  <p className="label">Landlord Email Id:</p>
                  <p className="InputField">{tenantRoom.email}</p>

                  <p className="label">Address of the Room:</p>
                  <p className="InputField"> {tenantRoom.address}</p>
                </>
              ) : (
                <p className="no-room-message">You don't have any room.</p>
              )}
            </div>
            {tenantRoom && (
              <div className="second-btn">
                <button className="profile-btn">Release Room</button>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="renderbox" style={{ overflow: "auto" }}>
            <div className="second-heading">
              <h1>Your Personal Details</h1>
            </div>
            <div className="second-content">
              <p className="label">Name:</p>
              <p className="InputField">{userData?.name}</p>

              <p className="label">Email Id:</p>
              <p className="InputField">{userData?.email}</p>

              <p className="label">Contact Details:</p>
              <p className="InputField"> {userData?.contactNumber}</p>

              <p className="label">Aadhar Number:</p>
              <p className="InputField"> {userData?.aadharNumber}</p>
            </div>
          </div>
        );
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await axios.delete(
        `api/user/profile/${userEmail}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.data.success) {
        throw new Error("Failed to delete user");
      }

      window.localStorage.clear();
      console.log("User deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <div className="firstsec">
          <ul>
            <li onClick={() => setSelectedOption("PersonalDetails")}>
              Personal Details
            </li>
            <li onClick={() => setSelectedOption("RoomDetails")}>
              Room Details
            </li>
            <button onClick={deleteAccount} className="profile-btn">
              Delete Account
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="profile-btn"
            >
              Update Details
            </button>
          </ul>
        </div>
        <div className="second">
          {renderContent()}
          <div className="second-btn"></div>
        </div>
        <div className="profile-section" style={{ border: "2px solid red" }}>
          {userData && userData.profilePhoto && (
            <img
              src={userData.profilePhoto}
              alt="Profile"
              className="profile-photo"
            />
          )}
          <form onSubmit={handleFormSubmit}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ backgroundColor: "#f20674" }}
            />
            <button type="submit" className="profile-btn">
              Upload Photo
            </button>
          </form>
          <div className="ratings">
            <h3>Your Ratings</h3>
            <p>5 stars</p>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)}>
        <h2>Update Your Details</h2>
        <form
          style={{
            
            backgroundColor: "pink",
            display: "flex",
            flexDirection: "column",
            justifyContent:"center",
            alignItems:"center"
          }}
          onSubmit={handleUpdateSubmit}
        >
          
            <input
              style={{width:"300px",margin:"10px"}}
              placeholder="Your Name"
              type="text"
              name="name"
              value={updatedData.name}
              onChange={handleUpdateChange}
            />
          
            <input
            style={{width:"300px",margin:"10px"}}
            placeholder="Your Email"
              type="email"
              name="email"
              value={updatedData.email}
              onChange={handleUpdateChange}
            />
          
            <input
            style={{width:"300px",margin:"10px"}} 
            placeholder="Your Contact Number"
              type="text"
              name="contactNumber"
              value={updatedData.contactNumber}
              onChange={handleUpdateChange}
            />
          
            <input
            style={{width:"300px",margin:"10px"}}
              type="text"
              name="aadharNumber"
              placeholder="Aadhar Number"
              value={updatedData.aadharNumber}
              onChange={handleUpdateChange}
            />
          
          <button style={{backgroundColor:"#f20674", color:"white",padding:"5px 20px", margin:"5px", borderRadius:"10px",border:"none"}} type="submit">Update</button>
          <button style={{backgroundColor:"#f20674", color:"white",padding:"5px 20px", margin:"5px", borderRadius:"10px",border:"none"}} type="button" onClick={() => setIsModalOpen(false)}>
            Cancel
          </button>
        </form>
      </Modal>
    </>
  );
};

export default ProfilePage;
