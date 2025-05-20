import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/forgotPassword.css"

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleForgotPwd = async function (e) {
        e.preventDefault();

        setError("");
        setSuccess(false);

        if (!email) {
            setError("Field is required");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/auth/forgot-pwd", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    navigate("/reset-password", { state: { email } }); // pass email for reset page
                }, 2000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Failed to send reset code.");
            }
        } catch (err) {
            setError("Unexpected error: " + err.message);
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
                    {/* SVG left arrow here */}
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
                    <button type="submit">Send Reset Code</button>
                </form>

                {error && <div className="error-message">{error}</div>}
                {success && (
                    <div className="success-pop-up">
                        <p>Reset code sent successfully to your email!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;
