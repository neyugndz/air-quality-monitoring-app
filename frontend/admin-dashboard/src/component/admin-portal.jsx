import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EyeIcon = ({ onClick, show }) => (
    <svg 
        onClick={onClick}
        className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer hover:text-gray-600 z-10"
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
    >
        {show ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-7.85-3.007-9.36-7 1.25-3.32 4.098-5 7.36-5 1.156 0 2.228.297 3.238.835m-5.49 5.49a2 2 0 01-2.828-2.828" />
        ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        )}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);


function AdminLogin() {
    const [username, setUsername] = useState("admin"); 
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate(); 

    const togglePasswordVisibility = () => {
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
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(credentials)
            });
            
            if (response.ok) {
                const data = await response.json();

                // Check if role is ADMIN
                if (data.role && data.role.toUpperCase() === "ADMIN") {
                    localStorage.setItem("admin_jwt_token", data.token);

                    setSuccess("Admin login successful!");
                    setTimeout(() => navigate("/dashboard"), 2000);
                } else {
                    setError("Only administrators are allowed to log in here.");
                }
            } else {
                let errorData = {};
                try {
                    errorData = await response.json();
                } catch (err) {
                    errorData.message = "An error occurred, please try again.";
                }

                setError(errorData.message);
            }
        } catch (error) {
            setError("There was an unexpected error: " + error.message);
        }
    };


    return (
        <div className='flex justify-center items-center p-8 min-h-screen bg-gray-100'>
            
            {/* Logo/Header (Top Left) */}
            <div className="absolute top-4 left-4">
                <img
                    src="https://www.vnpt-technology.vn/front/images/logo_vnpt_technology_vn.svg"
                    alt="Logo VNPT Technology"
                    className="h-10"
                />
            </div>

            <div className='flex flex-col md:flex-row justify-center items-center max-w-6xl w-full'>
                
                {/* Left Side: Branding/Slogan */}
                <div className="hidden lg:block lg:w-1/2 p-10 text-center">
                    <span className="text-5xl font-extrabold text-blue-800 leading-snug tracking-wider uppercase" style={{ fontFamily: '"Protest Strike", sans-serif' }}>
                        Admin Portal
                    </span>
                    <p className="mt-4 text-xl text-blue-600 font-medium">
                        Air Quality Monitoring System Management
                    </p>
                </div>

                {/* Right Side: Login Form Container */}
                <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-xl shadow-2xl transition-all duration-300 hover:shadow-3xl lg:w-1/2" style={{ boxShadow: '0 4px 30px rgba(0, 76, 155, 0.2)' }}>
                    <h2 className="mt-2 text-center text-3xl font-bold text-blue-900 mb-6 border-b pb-2">
                        Admin Login
                    </h2>
                    <form onSubmit={handleLogin} className='space-y-6'>
                        
                        {/* Username Field */}
                        <div className="relative">
                            <label htmlFor="username" className="sr-only">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                required
                                placeholder='Tên đăng nhập'
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-4 border border-gray-300 rounded-lg text-lg text-gray-700 bg-gray-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                            />
                        </div>

                        {/* Password Field */}
                        <div className="relative">
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                required
                                placeholder='Mật khẩu'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 border border-gray-300 rounded-lg text-lg text-gray-700 bg-gray-50 pr-12 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                            />
                             <EyeIcon onClick={togglePasswordVisibility} show={showPassword} />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-lg rounded-lg transition-all duration-300 shadow-md transform hover:scale-[1.01] active:scale-95"
                        >
                            Submit
                        </button>
                    </form>

                    {/* Footer Links (Admin thường chỉ có Forgot Password) */}
                    <div className="text-center mt-5 space-y-2">
                        <div className="text-sm">
                            <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                                Forgot Password?
                            </a>
                        </div>
                        {/* Admin Portal thường không có đăng ký */}
                        {/* <div className="text-sm text-gray-500">
                            Bạn không phải quản trị viên? <a href="/login" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">Đăng nhập User</a>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* Display Success or Error Message (Toast/Popup style) */}
            {error && (
                <div className="fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-xl flex items-center space-x-3 transition-opacity duration-300 z-50">
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {success && (
                <div className="fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-xl flex items-center space-x-3 transition-opacity duration-300 z-50">
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="font-medium">{success}</span>
                </div>
            )}
        </div>
    );
}

export default AdminLogin;
