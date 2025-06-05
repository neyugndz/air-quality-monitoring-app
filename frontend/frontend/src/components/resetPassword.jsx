import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/resetPassword.css";

function ResetPassword() {
    const navigate = useNavigate();
    const email = sessionStorage.getItem("email"); // Retrieve email from sessionStorage

     // If email doesn't exist in sessionStorage, redirect back to ForgotPassword page
    useEffect(() => {
        if (!email) {
            navigate("/login");
        }
    }, [email, navigate]);

    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleReset = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!code || !newPassword || !confirmPassword) {
            setError("All fields are required.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/reset-pwd`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, newPassword, confirmPassword }),
            });

            if (response.ok) {
                setSuccess("Password reset successful!");
                setTimeout(() => {
                    sessionStorage.removeItem("email");
                    setSuccess("");
                    navigate("/login");
                }, 3000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Failed to reset password.");
            }
        } catch (err) {
            setError("Unexpected error: " + err.message);
        }
    };


    const toggleNewPasswordVisibility = () => {
        setShowNewPassword((prev) => !prev);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword((prev) => !prev);
    };


    return (
        <div className="reset-password-page">
            <div className="header">
                <img
                    src="https://www.vnpt-technology.vn/front/images/logo_vnpt_technology_vn.svg"
                    alt="Logo VNPT Technology"
                />
            </div>
            <div className="container">
                <h2>Reset Password</h2>
                <p>Enter the reset code sent to your email and your new password.</p>
                {email && <p>Your email: {email}</p>} {/* Display email */}
                <form onSubmit={handleReset}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Reset code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ display: "flex", alignItems: "center", position: "relative" }}>
                        <input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={{ flexGrow: 1, paddingRight: "35px" }}
                        />
                        <i
                            className={`password-toggle-icon fa ${showNewPassword ? "fa-eye-slash" : "fa-eye"}`}
                            onClick={toggleNewPasswordVisibility}
                            style={{ cursor: "pointer", marginLeft: "-30px", zIndex: 1 }}
                        />
                    </div>
                    <div className="form-group" style={{ display: "flex", alignItems: "center", position: "relative" }}>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{ flexGrow: 1, paddingRight: "35px" }}
                        />
                        <i
                            className={`password-toggle-icon fa ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}
                            onClick={toggleConfirmPasswordVisibility}
                            style={{ cursor: "pointer", marginLeft: "-30px", zIndex: 1 }}
                        />
                    </div>
                    <button type="submit">Reset Password</button>
                </form>

                {error && <div className="error-message"><i className="fa fa-times-circle"></i> {error}</div>}
                {success && <div className="success-pop-up"><i className="fa fa-check-circle"></i> {success}</div>}

                <Link to="/login">Back to Login</Link>
            </div>
        </div>
    );
}

export default ResetPassword;
