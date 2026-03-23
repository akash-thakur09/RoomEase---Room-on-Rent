import React, { useState } from 'react'
// import Navbar from '../../Pages/navbar';
import basestyle from '../Base.module.css'
import loginstyle from './Login.module.css';
import '../../css/landlordLogin.css';
import { useNavigate, NavLink } from 'react-router-dom'

export default function Login() {
  const [credentials, setCredentials] = useState({ email: "", role: "tenant", password: "" })
  let navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("api/auth/login", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: credentials.email, role: credentials.role, password: credentials.password })

    });
    const json = await response.json();
    console.log(json);
    if (json.success) {
      localStorage.setItem('userEmail', credentials.email);
      localStorage.setItem('token', json.data.authToken);
      localStorage.setItem('userId', json.data.userId);
      localStorage.setItem('role', json.data.role);

      if (json.data.role === 'landlord') {
        navigate("/landlordProfile");
      } else {
        navigate("/home");
      }
    } else {
      alert(json.message || "Enter Valid Credentials");
    }
  }

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

  return (
    <div className="loginBox">
        
        <div className={loginstyle.login}>
          <form onSubmit={handleSubmit}>
            <h1>Login</h1>
            <select
            name="role"
            id="role"
            onChange={onChange}
            value={credentials.role}
          >
            <option value="tenant">Tenant</option>
            <option value="landlord">Landlord</option>
          </select>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              onChange={onChange}
              value={credentials.email}
            />
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              onChange={onChange}
              value={credentials.password}
            />
           
            <button className={basestyle.button_common} >
              Sign In
            </button>
          </form>
          <NavLink to="/signup">Not yet registered? Sign Up</NavLink>
      </div>
     
    </div>
    
  )
}
