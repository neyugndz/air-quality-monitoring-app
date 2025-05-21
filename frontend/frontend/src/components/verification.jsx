import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/verification.css";

function VerificationPage() {
    const navigate = useNavigate();
    const email = sessionStorage.getItem("email");
    useEffect(() => {
        if (!email) {
            navigate("/login");
        }
    }, [email, navigate]);

    const [verificationCode, setVerificationCode] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleVerification = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!verificationCode) {
            setError("Please enter the verification code.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: verificationCode }), // Send the verification code
            });

            if (response.ok) {
                setSuccess("Account verified successfully!");
                setTimeout(() => {
                    sessionStorage.removeItem("email");
                    setSuccess("");
                    navigate("/login"); // Redirect to login after successful verification
                }, 2000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Verification failed.");
            }
        } catch (err) {
            setError("Unexpected error: " + err.message);
        }
    };

    return (
        <div className="verification-page">
            <div className="header">
                <img
                    src="https://www.vnpt-technology.vn/front/images/logo_vnpt_technology_vn.svg"
                    alt="Logo VNPT Technology"
                />
            </div>
            <div className="container">
                <h2>Account Verification</h2>
                <p>Enter the verification code sent to your email.</p>
                {email && <p>Your email: {email}</p>}
                <form onSubmit={handleVerification}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Verification code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                        />
                    </div>
                    <button type="submit">Verify Account</button>
                </form>

                {error && <div className="error-message"><i className="fa fa-times-circle"></i> {error}</div>}
                {success && <div className="success-pop-up"><i className="fa fa-check-circle"></i> {success}</div>}

                <Link to="/login">Back to Login</Link>
            </div>
        </div>
    );
}

export default VerificationPage;
