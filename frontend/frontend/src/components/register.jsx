import {React, useState} from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../css/register.css';

function Register(){
    const[email, setEmail] = useState("");
    const[username, setUsername] = useState("");
    const[password, setPassword] = useState("");
    const[rePassword, setRePassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isClicked, setIsClicked] = useState(false);
    
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const toggleRePasswordVisibility = () => {
        setShowRePassword((prev) => !prev);
    };
    
    const handleRegister = async (e) => {
        e.preventDefault()

        setError("");
        setSuccess("");


        if(!email || !username || !password) {
            setError("All fields are required");
            return;
        }

        setIsClicked(true);

        const payload = {
            email, 
            name: username, 
            password,
            confirmPassword: rePassword
        }
        try {
            const response = await fetch("http://localhost:8080/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
      
            if (response.ok) {
                sessionStorage.setItem("email", email);

                setSuccess("You have successfully registered!");
                setTimeout(() => {
                    setSuccess("");
                    navigate("/verify");
                }, 3000);

            } else {
              let errorData = {};
              try {
                errorData = await response.json();
              } catch {
                errorData.message = "An error occurred, please try again.";
              }
              setError(errorData.message || "Registration failed.");
            }
          } catch (err) {
            setError("There was an unexpected error: " + err.message);
          } finally {
            // Re-enable the button after the process completes (whether successful or not)
            setIsClicked(false);
        }
    }
    return (
        <div className='register-page'>
            <div className='register-container'>            
                <div className="header">
                    <img
                    src="https://www.vnpt-technology.vn/front/images/logo_vnpt_technology_vn.svg"
                    alt="Logo VNPT Technology"
                    />
                </div>
                <div className="register-container-form">
                    <h2>Register</h2>
                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            placeholder='Email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            placeholder='Username'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div
                            className="form-group"
                            style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
                            >
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
                            <div
                            className="form-group"
                            style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
                            >
                            <input
                                style={{ flexGrow: 1, paddingRight: '35px' }}
                                type={showRePassword ? "text" : "password"}
                                id="re-password"
                                name="re-password"
                                placeholder='Re-enter your password'
                                value={rePassword}
                                onChange={(e) => setRePassword(e.target.value)}
                            />
                            <i
                                className={`password-toggle-icon fa ${showRePassword ? "fa-eye-slash" : "fa-eye"}`}
                                onClick={toggleRePasswordVisibility}
                                style={{
                                cursor: 'pointer',
                                marginLeft: '-30px',
                                zIndex: 1
                                }}
                            />
                        </div>

                        <button type="submit" disabled={isClicked}>
                            {isClicked ? "Registering..." : "Register"}
                        </button>
                        
                        <div className="register">
                                Already have an account? <NavLink to="/login">Sign in</NavLink>
                        </div>
                    </form>

                    {/* Display error or success message */}
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
                </div>
            </div>
        </div>
    );
};

export default Register;