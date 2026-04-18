import { useState } from "react";
import {
  Typography,
  Alert,
  Snackbar,
  AppBar,
  Toolbar,
  CircularProgress,
} from "@mui/material";
import "./Form.css";

const Form = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [loading, setLoading] = useState(false); // ✅ NEW

  const [isSubmitted, setIsSubmitted] = useState({
    submitted: false,
    emailSent: false,
  });

  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [info, setInfo] = useState({
    names: "",
    series: "",
    types: "",
  });

  const [venue, setVenue] = useState({
    stadium: "",
    location: "",
    country: "",
  });

  const [error, setError] = useState("");

  // ✅ Validation
  const validateSetup = () => {
    if (
      !admin.name ||
      !admin.email ||
      !admin.phone ||
      !admin.address ||
      !info.names ||
      !info.series ||
      !info.types ||
      !venue.stadium ||
      !venue.location ||
      !venue.country
    ) {
      setError("All fields are mandatory");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(admin.email)) {
      setError("Invalid email format");
      return false;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(admin.phone)) {
      setError("Invalid phone number (10 digits, start 6-9)");
      return false;
    }

    setError("");
    return true;
  };

  // ✅ Submit
  const handleSubmitSetup = async () => {
    if (!validateSetup()) return;

    setLoading(true); // 🔥 start loading

    try {
      const payload = { admin, info, venue };

      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/admin/setup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error();

      const body = await res.json();
      const emailSent = Boolean(body?.emailSent);

      setSnackbar({
        open: true,
        message:
          body?.message ||
          (emailSent
            ? "Setup saved; confirmation email sent."
            : "Setup saved."),
        severity: "success",
      });

      setIsSubmitted({ submitted: true, emailSent });

      // Reset form
      setAdmin({ name: "", email: "", phone: "", address: "" });
      setInfo({ names: "", series: "", types: "" });
      setVenue({ stadium: "", location: "", country: "" });

    } catch {
      setSnackbar({
        open: true,
        message: "Data save operation failed",
        severity: "error",
      });
    } finally {
      setLoading(false); // 🔥 stop loading
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div>
      {/* HEADER */}
      <AppBar position="fixed" className="appbar">
        <Toolbar>
          <Typography variant="h6">WELCOME</Typography>
        </Toolbar>
      </AppBar>

      <div className="adjusted-container">
        <div className="login-container">
          <div className="login-right">
            <h2 className="admin-title">SETUP PANEL</h2>

            {/* ADMIN */}
            <h4 className="heading">Admin</h4>
            <input
              placeholder="Name"
              value={admin.name}
              onChange={(e) => setAdmin({ ...admin, name: e.target.value })}
              disabled={loading}
            />
            <input
              placeholder="Email"
              value={admin.email}
              onChange={(e) =>
                setAdmin({ ...admin, email: e.target.value.trim() })
              }
              disabled={loading}
            />
            <input
              placeholder="Phone"
              value={admin.phone}
              onChange={(e) =>
                setAdmin({
                  ...admin,
                  phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
              disabled={loading}
            />
            <input
              placeholder="Address"
              value={admin.address}
              onChange={(e) =>
                setAdmin({ ...admin, address: e.target.value })
              }
              disabled={loading}
            />

            {/* LEAGUE */}
            <h4 className="heading">League</h4>
            <input
              placeholder="League Name"
              value={info.names}
              onChange={(e) => setInfo({ ...info, names: e.target.value })}
              disabled={loading}
            />
            <input
              placeholder="Short Form"
              value={info.series}
              onChange={(e) => setInfo({ ...info, series: e.target.value })}
              disabled={loading}
            />
            <input
              placeholder="Match Type"
              value={info.types}
              onChange={(e) => setInfo({ ...info, types: e.target.value })}
              disabled={loading}
            />

            {/* VENUE */}
            <h4 className="heading">Venue</h4>
            <input
              placeholder="Stadium"
              value={venue.stadium}
              onChange={(e) =>
                setVenue({ ...venue, stadium: e.target.value })
              }
              disabled={loading}
            />
            <input
              placeholder="Location"
              value={venue.location}
              onChange={(e) =>
                setVenue({ ...venue, location: e.target.value })
              }
              disabled={loading}
            />
            <input
              placeholder="Country"
              value={venue.country}
              onChange={(e) =>
                setVenue({ ...venue, country: e.target.value })
              }
              disabled={loading}
            />

            {/* ERROR */}
            {error && <p className="error-msg">{error}</p>}

            {/* SUBMIT */}
            <div style={{ margin: "20px 0" }}>
              <button
                type="button"
                className="login-btn"
                onClick={handleSubmitSetup}
                style={{ width: "100%" }}
                disabled={loading}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                    <CircularProgress size={20} color="inherit" />
                    Saving...
                  </span>
                ) : (
                  "Save"
                )}
              </button>
            </div>

            {/* INFO MESSAGE */}
            <p className="photo-instruction">
              {isSubmitted.submitted
                ? isSubmitted.emailSent
                  ? "Please check your email for the setup confirmation."
                  : "Setup saved. No email was sent — set EMAIL_USER and EMAIL_PASS on the server, or check the admin email in setup."
                : "Customize your Crick-App from here"}
            </p>
          </div>
        </div>
      </div>

      {/* SNACKBAR */}
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

export default Form;