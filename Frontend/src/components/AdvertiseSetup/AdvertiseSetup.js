import { useEffect, useState, useRef } from "react";
import {
  AppBar,
  Toolbar,
  Alert,
  Snackbar,
  Typography,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import heic2any from "heic2any";
import "./AdvertiseSetup.css";

const AdvertiseSetup = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [photos, setPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUD_NAME}/image/upload`;

  // ---------------- UPLOAD TO CLOUDINARY ----------------
  const handlePhotoUpload = async (files) => {
    try {
      if (!files || files.length === 0) return;

      setUploading(true); // ✅ important
      setError("");

      const validFiles = await Promise.all(
        Array.from(files).map(async (file) => {
          let uploadFile = file;

          // HEIC → JPG
          if (
            file.type === "image/heic" ||
            file.type === "image/heif" ||
            file.name.toLowerCase().endsWith(".heic")
          ) {
            try {
              const blob = await heic2any({
                blob: file,
                toType: "image/jpeg",
                quality: 0.8,
              });

              uploadFile = new File(
                [blob],
                file.name.replace(/\.heic/i, ".jpg"),
                { type: "image/jpeg" }
              );
            } catch {
              return null;
            }
          }

          if (!uploadFile.type.startsWith("image/")) return null;
          if (uploadFile.size > 5 * 1024 * 1024) return null;

          return uploadFile;
        })
      );

      const uploads = validFiles.filter(Boolean).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "upload_preset",
          process.env.REACT_APP_UPLOAD_PRESET_1 // ✅ Advertise preset
        );

        const res = await fetch(CLOUDINARY_URL, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!data.secure_url) return null;

        return {
          name: file.name,
          url: data.secure_url,
          public_id: data.public_id,
        };
      });

      const results = await Promise.all(uploads);
      const filtered = results.filter(Boolean);

      setPhotos((prev) => [...prev, ...filtered]);
      setNewPhotos((prev) => [...prev, ...filtered]);

    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false); // ✅ important
    }
  };

  // ---------------- FETCH ADS ----------------
  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/admin/advertise`
      );
      const data = await res.json();
      setPhotos(data?.photos || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (public_id) => {
    try {
      await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/admin/advertise/${public_id}`,
        { method: "DELETE" }
      );

      setPhotos((prev) =>
        prev.filter((p) => p.public_id !== public_id)
      );

      setNewPhotos((prev) =>
        prev.filter((p) => p.public_id !== public_id)
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- SAVE ----------------
  const handleSaveAds = async () => {
    if (newPhotos.length === 0) {
      setError("Please upload at least one advertisement first");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/admin/advertise`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photos: newPhotos }),
        }
      );

      if (!res.ok) throw new Error();

      setSnackbar({
        open: true,
        message: "Advertisements saved successfully",
        severity: "success",
      });

      setNewPhotos([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch {
      setSnackbar({
        open: true,
        message: "Advertisement save failed",
        severity: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // ---------------- UI ----------------
  return (
    <div className="landing-container">
      <AppBar position="fixed" className="appbar">
        <Toolbar>
          <Typography variant="h6">ADVERTISEMENT PANEL</Typography>
        </Toolbar>
      </AppBar>

      {/* Upload Section */}
      <div className="adjusted-container">
        <div className="login-container">
          <div className="login-right">
            <h2 className="admin-title">ADVERTISEMENT PANEL</h2>
            <h4 className="heading">Upload Ads</h4>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handlePhotoUpload(e.target.files)}
            />

            {/* Uploading indicator */}
            {uploading && <p className="upload-msg">Uploading image...</p>}

            {error && <p className="error-msg">{error}</p>}

            <button
              className="login-btn"
              onClick={handleSaveAds}
              disabled={uploading || newPhotos.length === 0}
              style={{ width: "100%" }}
            >
              {uploading ? "Uploading..." : "Upload Ads"}
            </button>

            <p className="photo-instruction">
              Upload banner-style advertisement images
            </p>
          </div>
        </div>
      </div>

      {/* Showcase */}
      <div className="main-content1">
        <div className="profile-container1">
          {photos.map((ad, index) => (
            <div key={index} className="photo-wrapper">
              <IconButton
                className="delete-btn"
                onClick={() => handleDelete(ad.public_id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>

              <img
                src={ad.url}
                alt={ad.name}
                className="circular-photo"
              />

              <Typography variant="h6" className="profile-name">
                {ad.name?.replace(/\.[^/.]+$/, "")}
              </Typography>
            </div>
          ))}
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AdvertiseSetup;