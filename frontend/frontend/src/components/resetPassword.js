import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "../css/resetPassword.css";

function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || "";

    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess(false);

        if (!code || !newPassword || !confirmPassword) {
            setError("All fields are required.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/auth/reset-pwd", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, newPassword, confirmPassword }),
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
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

    return (
        <div className="reset-password-page">
            <div className="container">
                <h2>Reset Password</h2>
                <p>Enter the reset code sent to your email and your new password.</p>
                <form onSubmit={handleReset}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Reset code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit">Reset Password</button>
                </form>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-pop-up">Password reset successful!</div>}

                <Link to="/login">Back to Login</Link>
            </div>
        </div>
    );
}

export default ResetPassword;
