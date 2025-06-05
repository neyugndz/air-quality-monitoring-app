import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/forgotPassword.css";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isClicked, setIsClicked] = useState(false);
    const navigate = useNavigate();

    const handleForgotPwd = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        
        if (!email) {
            setError("Field is required");
            return;
        }

        // Disable button when submitting
        setIsClicked(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/forgot-pwd`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                // Store email in sessionStorage before navigating
                sessionStorage.setItem("email", email);

                setSuccess("Reset code sent successfully to your email!");
                setTimeout(() => {
                    setSuccess("");
                    navigate("/reset-password");
                }, 2000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Failed to send reset code.");
            }
        } catch (err) {
            setError("Unexpected error: " + err.message);
        } finally {
            // Re-enable the button after the process completes (whether successful or not)
            setIsClicked(false);
        }
    };

    return (
        <div className="forgot-page">
            <div className="header">
                <img
                    src="https://www.vnpt-technology.vn/front/images/logo_vnpt_technology_vn.svg"
                    alt="Logo VNPT Technology"
                />
            </div>
            <div className="container">
                <Link to="/login" className="return-btn">
                    <i className="fa-solid fa-arrow-left" style={{ color: "#ffffff" }}></i>
                </Link>
                <h2>Forgot Password?</h2>
                <p>Enter your email address, and we'll send you a code to reset your password.</p>
                <form onSubmit={handleForgotPwd}>
                    <div className="form-group">
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button type="submit" disabled={isClicked}>
                        {isClicked ? "Sending..." : "Send Reset Code"}
                    </button>
                </form>

                {error && <div className="error-message"><i className="fa fa-times-circle"></i> {error}</div>}
                {success && (
                    <div className="success-pop-up">
                        <i className="fa fa-check-circle"></i> {success}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;
