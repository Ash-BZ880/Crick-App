import { useState } from "react";
import {
  Typography,
  Alert,
  Snackbar,
  AppBar,
  Toolbar,
} from "@mui/material";
import "./EditPass.css";

const EditPass = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [loading, setLoading] = useState(false); // optional UX improvement

  const handlePasswordChange = async () => {
    setError("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ oldPassword, newPassword }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Password change failed.");
      } else {
        setSnackbar({
          open: true,
          message: "Password changed successfully!",
          severity: "success",
        });
        setIsSubmitted(true);
        // ✅ CLEAR INPUTS ONLY ON SUCCESS
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Something went wrong. Please try again later.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div>
      <AppBar position="fixed" className="appbar">
        <Toolbar>
          <Typography variant="h6">WELCOME</Typography>
        </Toolbar>
      </AppBar>

      <div className="adjusted-container">
        <div className="login-container">
          <div className="login-right">
            <h2 className="admin-title">EDIT PASSWORD</h2>

            <input
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && <p className="error-msg">{error}</p>}

            <button
              className="login-btn"
              onClick={handlePasswordChange}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>

             <p className="photo-instruction">
              {isSubmitted
                ? "Please check your email for notification"
                : "Edit your password from here"}
            </p>

          </div>
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          className="snackbar-alert"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default EditPass;