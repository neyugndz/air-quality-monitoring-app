import React, { useState } from 'react';
import { NavLink, useNavigate} from 'react-router-dom';
import '../css/login.css';

function Login(){
    const[username, setUsername] = useState("");
    const[password, setPassword] = useState("");
    const[showPassword, setShowPassword] = useState(false);
    const[error, setError] = useState("");
    const[success, setSuccess] = useState("");
    const navigate = useNavigate();

    const togglePasswordVisibility = () =>  {
        setShowPassword((prev) => !prev);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!username || !password) {
            setError("Please fill in both fields.");
            return;
        }

        const credentials = {
            email: username,
            password: password
        }

        try{
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(credentials)
            });
            
            if (response.ok) {
                const data = await response.json();
                sessionStorage.setItem("jwt_token", data.token);
                setSuccess("Login successful!");
                setTimeout(() => navigate("/home"), 2000);
            } else {
                let errorData = {};
                try {
                    errorData = await response.json();
                } catch (err) {
                    // If JSON parsing fails, set a default error message
                    errorData.message = "An error occurred, please try again.";
                }
 
                setError(errorData.message);
            }
        } catch (error) {
            setError("There was an unexpected error: " + error.message);
        }
    };

    return (
        <div className='login-page'>
            <div className='login-container'>
                <div className="header">
                    <img
                    src="https://www.vnpt-technology.vn/front/images/logo_vnpt_technology_vn.svg"
                    alt="Logo VNPT Technology"
                    />
                </div>
                <div className="logo">
                    <span className="logo-text">Air Quality Monitoring Application</span>
                </div>
                <div className="login-container-form">
                    <h2>Login</h2>
                    <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        required="" 
                        placeholder='Username' 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <input
                            style={{ flexGrow: 1, paddingRight: '35px' }} 
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            placeholder='Password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <i
                            className={`password-toggle-icon fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                            onClick={togglePasswordVisibility}
                            style={{
                            cursor: 'pointer',
                            marginLeft: '-30px', 
                            zIndex: 1
                            }}
                        />
                    </div>
                    <input type="submit" defaultValue="Submit" />
                    </form>

                    {/* Display Success or Error Message */}
                    {error && (
                        <div className="error-message">
                            <i className="fa fa-times-circle"></i> {error}
                        </div>
                    )}

                    {success && (
                        <div className="success-pop-up">
                            <i className="fa fa-check-circle"></i> {success}
                        </div>
                    )}

                    <div className="footer">
                            Forgot password? <NavLink to="/forgot-password">Click here</NavLink>
                    </div>
                    <div className="register">
                            Don't have an account? <NavLink to="/register">Register</NavLink>
                    </div>
                </div>
            </div>
            </div>
    );
};

export default Login;