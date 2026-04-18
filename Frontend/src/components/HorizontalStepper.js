// Done
import React  from "react";
import {
  TextField,
  Button,
  Step,
  StepLabel,
  Stepper,
  Typography,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  makeStyles,
} from "@material-ui/core";

import { IconButton, Box } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useState, useEffect} from "react";

import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  main: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    height: "88vh",
  },

    data1: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",  
  },

      data2: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",  
  },

  mainContainer1: {
    width: "100%",
    maxWidth: "100%",
    padding: "1rem",
    boxSizing: "border-box",
  },

  "@media (max-width: 630px)": {
    mainContainerA1: {
      "& .MuiStepLabel-label": {
        display: "none", // ❌ hide text (Team, Squad...)
      },
      "& .MuiStep-root": {
        paddingLeft: 6,
        paddingRight: 6,
      },
    },
  },

  "@media (max-width: 550px)": {
    mainContainerA1: {
      padding: "2px",
      margin: "2px",
    },
    mainContainer1: {
      padding: "2px",
      boxSizing: "border-box",
      margin: "2px",
    },
  },

  "@media (max-width: 490px)": {
    mainContainerA1: {
      padding: "1px",
      margin: "1px",
    },
    mainContainer1: {
      padding: "1px",
      boxSizing: "border-box",
      margin: "1px",
    },
  },

  "@media (max-width: 450px)": {
    mainContainerA1: {
      padding: "1px",
      margin: "1px",
      "& .MuiStep-root": {
        paddingLeft: 4, // adjust as needed
        paddingRight: 4,
      },
      "& .MuiStepLabel-label": {
        fontSize: "0.9rem", // optional: reduce text size
      },
    },

    mainContainer1: {
      padding: "1px",
      boxSizing: "border-box",
      margin: "0px",
    },
  },

  mainContainer2: {
    margin: "auto",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    maxWidth: "500px",
    width: "100%",
    height: "400px",
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  "@media (max-width: 768px)": {
    mainContainer2: {
      padding: "1rem",
    },
  },

  "@media (max-width: 480px)": {
    mainContainer2: {
      padding: "0.2rem",
    },
  },

  team1: {
    width: 200,
  },

  circle: {
    backgroundColor: "rgb(63, 81, 181)",
    height: "40px",
    width: "40px",
    borderRadius: "25px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    margin: "20px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease",
    "&:hover": {
      transform: "scale(1.1)",
    },
  },

  team2: {
    width: 200,
    marginBottom: "30px",
  },

  overs: {
    width: 200,
  },

  overscontainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  overcircle: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "120px",
    width: "120px",
    borderRadius: "60px",
    margin: "20px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    color: "white",
    fontSize: "2rem",
    transition: "transform 0.3s ease",
    "&:hover": {
      transform: "scale(1.1)",
    },
  },

  radioGroup: {
    margin: "20px",
  },

  formGroup: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  formContainer: {
    margin: "2rem 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  backButton: {
    marginRight: theme.spacing(8),
  },

  mainContainer3: {
    margin: "auto",
    border: "1px solid #ccc",
    borderRadius: "4px",
    maxWidth: "600px",
    width: "100%",
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const HorizontalStepper = ({
  toss,
  win,
  setToss,
  setDecision,
  Globalstate,
  setGlobalstate,
  newMatch,
  setNewMatch,
}) => {
  const navigate = useNavigate();
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [isSubmitting, setSubmitting] = React.useState(false);
  const [playersCount, setPlayersCount] = useState(() => {
    const saved = localStorage.getItem("playersCount");
    return saved ? parseInt(saved) : 11;
  });

  const steps = ["Team", "Squad", "Over", "Match", "Toss", "Save"];


  const initialValues = {
  team1: localStorage.getItem("team1") || "",
  team2: localStorage.getItem("team2") || "",
  players: playersCount,
  maxOver: localStorage.getItem("maxOver") || "",
  matchType: localStorage.getItem("matchType") || "Normal",
  tossWinner: localStorage.getItem("tossWinner") || "",
  decision: localStorage.getItem("decision") || "",
  newmatch: false,
 };

  const handleIncrement = () => {
    if (playersCount < 12) {
      const updated = playersCount + 1;
      setPlayersCount(updated);
      localStorage.setItem("playersCount", updated);
    }
  };

  const handleDecrement = () => {
    if (playersCount >= 5) {
      const updated = playersCount - 1;
      setPlayersCount(updated);
      localStorage.setItem("playersCount", updated);
    }
  };

  const validationSchema = [
    Yup.object().shape({
      team1: Yup.string().required("Team Name is required"),
      team2: Yup.string().required("Team Name is required"),
    }),
    Yup.object().shape({
      players: Yup.string().required("Number of players is required"),
    }),
    Yup.object().shape({
      maxOver: Yup.string().required("Overs are required"),
    }),
    Yup.object().shape({
    matchType: Yup.string().required("Match type is required"), // ✅ NEW
    }),
    Yup.object().shape({
      tossWinner: Yup.string().required("Toss winner is required"),
    }),
    Yup.object().shape({
      decision: Yup.string().required("Decision is required"),
    }),
  ];

  const currentValidationSchema = validationSchema[activeStep];

  const [info, setInfo] = useState(null);

 useEffect(() => {
    const fetchSetup = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/admin/setup`
        );

        if (!res.ok) throw new Error("API failed");

        const data = await res.json();

        if (data.success && data.data) {
          setInfo(data.data.info || {});
        } else {
        }
      } catch (err) {
        console.error(err);
      } finally {
      }
    };

    fetchSetup();
  }, []);

  function isLastStep() {
    return activeStep === steps.length - 1;
  }

  return (
    <div className={classes.main}>
      {/* Part A (Slider) */}
      <div className={classes.mainContainer1}>
        <Stepper
          activeStep={activeStep}
          className={classes.mainContainerA1}
          orientation="horizontal"
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </div>
      {/* Part B (Form) */}
      <div className={classes.mainContainer2}>
        <Formik
          enableReinitialize
          validationSchema={currentValidationSchema}
          initialValues={initialValues}
          // onSubmit={(values, actions) => {
          //   if (isLastStep()) {
          //     setSubmitting(true);
          //     const batting = values.decision === 'bat' ? values.tossWinner : values.tossWinner === values.team1 ? values.team2 : values.team1;
          //     const data = { ...values, batting };
          //     localStorage.setItem('data', JSON.stringify(data));
          //     navigate('/score', { state: { batting } }); // ✅ pass data with `state`
          //     setSubmitting(false);
          //     // implement here backend logic to store data
          //   } else {
          //     setActiveStep((prev) => prev + 1);
          //   }
          //   actions.setTouched({});
          //   actions.setSubmitting(false);
          // }}
          onSubmit={async (values, actions) => {
            actions.setTouched({});

            if (isLastStep()) {
              try {
                setSubmitting(true);
                actions.setSubmitting(true);

                const batting =
                  values.decision === "bat"
                    ? values.tossWinner
                    : values.tossWinner === values.team1
                    ? values.team2
                    : values.team1;

                const data = {
                  ...values,
                  players: playersCount-1,
                  maxOver: Number(values.maxOver),
                  newmatch: true, // ✅ Add it here directly
                  batting,
                };
                
                console.log(data);
                
                // console.log("Final POST Payload:", JSON.stringify(data, null, 2));

                await fetch(`${process.env.REACT_APP_API_BASE_URL}/matches`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                });
                
               // ✅ Clear persisted data
                localStorage.removeItem("team1");
                localStorage.removeItem("team2");
                localStorage.removeItem("playersCount");
                localStorage.removeItem("maxOver");
                localStorage.removeItem("matchType");
                localStorage.removeItem("tossWinner");
                localStorage.removeItem("decision");

                navigate("/score", { state: { batting } });
              } catch (error) {
                console.error("Error submitting match data:", error);
              } finally {
                setSubmitting(false);
                actions.setSubmitting(false);
              }
            } else {
              setActiveStep((prev) => prev + 1);
              actions.setSubmitting(false);
            }
          }}
          // Replace inside onSubmit in Formik:
        >
          {(props) => {
            const {
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
            } = props;
            return (
              <form onSubmit={handleSubmit}>
                <div className={classes.formContainer}>
                  {activeStep === 0 && (
                    // team selection
                    <>
                      {/* Team A */}
                      <TextField
                        id="team1"
                        name="team1"
                        label="Team 1 Name*"
                        value={values.team1}
                        // onChange={handleChange}
                        onChange={(e) => {
                          handleChange(e);
                          localStorage.setItem("team1", e.target.value); // Save input to localStorage
                        }}
                        onBlur={handleBlur}
                        helperText={
                          errors.team1 && touched.team1 && errors.team1
                        }
                        error={errors.team1 && touched.team1}
                        className={classes.team1}
                      />
                      {/* Circle */}
                      <div className={classes.circle}>
                        <Typography>VS</Typography>
                      </div>
                      {/* Team B */}
                      <TextField
                        id="team2"
                        name="team2"
                        label="Team 2 Name*"
                        value={values.team2}
                        // onChange={handleChange}
                        onChange={(e) => {
                          handleChange(e);
                          localStorage.setItem("team2", e.target.value); // Save input to localStorage
                        }}
                        onBlur={handleBlur}
                        helperText={
                          errors.team2 && touched.team2 && errors.team2
                        }
                        error={errors.team2 && touched.team2}
                        className={classes.team2}
                      />
                    </>
                  )}
                  {activeStep === 1 && (
                    // Player count
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      mt={2}
                    >
            
                      <Box display="flex" alignItems="center">
                        

                        <div className={classes.data1}>
                        <div className={classes.data2}> 
                        <IconButton
                          onClick={handleDecrement}
                          disabled={playersCount === 5}
                          sx={{
                            color: playersCount === 5 ? "grey.400" : "blue",
                          }}
                        >
                          <ArrowBackIosIcon />
                        </IconButton>
                        <div className={classes.circle}>
                          <Typography>{playersCount}</Typography>
                        </div>
                        <IconButton
                          onClick={handleIncrement}
                          disabled={playersCount === 11}
                          sx={{
                            color: playersCount === 11 ? "grey.400" : "blue",
                          }}
                        >
                          <ArrowForwardIosIcon />
                        </IconButton>
                        </div>
                        <div className={classes.overcircle}>
                          <img
                            src="/images/Photo3.png"
                            alt="Tennis Ball"
                            style={{ width: "200px", height: "200px" }}
                          />
                        </div>
                        </div>

                      </Box>
                      <Box mt={2} /> {/* Padding below the button section */}
                    </Box>
                  )}
                  {activeStep === 2 && (
                    // Number of over
                    <div className={classes.overscontainer}>
                      <TextField
                        id="maxOver"
                        name="maxOver"
                        label="Overs*"
                        value={values.maxOver}
                        onChange={(e) => {
                          handleChange(e);
                          localStorage.setItem("maxOver", e.target.value); // Save input to localStorage
                        }}
                        onBlur={handleBlur}
                        helperText={
                          errors.maxOver && touched.maxOver && errors.maxOver
                        }
                        error={errors.maxOver && touched.maxOver}
                        className={classes.overs}
                      />
                      <div className={classes.overcircle}>
                        <img
                          src="/images/Photo2.png"
                          alt="Tennis Ball"
                          style={{ width: "130px", height: "130px" }}
                        />
                      </div>
                    </div>
                  )}
                  {activeStep === 3 && (
                    <FormControl
                      component="fieldset"
                      className={classes.formGroup}
                      style={{ width: "100%" }}
                    >
                      {/* Centered Label */}
                      <FormLabel
                        component="legend"
                        style={{ textAlign: "center", width: "100%", marginBottom: "12px" }}
                      >
                        Match Type
                      </FormLabel>

                      {/* Grid Layout */}
                      <RadioGroup
                        name="matchType"
                        value={values.matchType}
                        onChange={(e) => {
                          setFieldValue("matchType", e.target.value);
                          localStorage.setItem("matchType", e.target.value);
                        }}
                        className={classes.radioGroup}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "10px 40px",
                          justifyItems: "start",
                          marginTop: "10px",
                        }}
                      >
                        <FormControlLabel value="Normal" control={<Radio />} label="Normal" />
                        <FormControlLabel value="SuperOver" control={<Radio />} label="Superover" />
                        <FormControlLabel value="Final" control={<Radio />} label="Final" />
                        <FormControlLabel value="Qualifier 2" control={<Radio />} label="Qualifier 2" />
                        <FormControlLabel value="Qualifier 1" control={<Radio />} label="Qualifier 1" />
                        <FormControlLabel value="Eliminator" control={<Radio />} label="Eliminator" />
                      </RadioGroup>
                    </FormControl>
                  )}
                  {activeStep === 4 && (
                    // Toss
                    <FormControl
                      component="fieldset"
                      className={classes.formGroup}
                    >
                      <FormLabel component="legend">
                        Who won the toss ?
                      </FormLabel>
                      <RadioGroup
                        name="tossWinner"
                        value={values.tossWinner}
                        onChange={(e) => {
                          setFieldValue("tossWinner", e.target.value); // Set Formik field value
                          setToss(e.target.value); // Update Toss prop with selected team
                          localStorage.setItem("tossWinner", e.target.value); // Add this
                        }}
                        className={classes.radioGroup}
                      >
                        <FormControlLabel
                          value={values.team1}
                          control={<Radio />}
                          label={values.team1}
                        />
                        <FormControlLabel
                          value={values.team2}
                          control={<Radio />}
                          label={values.team2}
                        />
                      </RadioGroup>
                    </FormControl>
                  )}
                  {activeStep === 5 && (
                    // Decision
                    <FormControl
                      component="fieldset"
                      className={classes.formGroup}
                    >
                      <FormLabel component="legend">{`${values.tossWinner} won the toss & choose`}</FormLabel>
                      <RadioGroup
                        name="decision"
                        value={values.decision}
                        onChange={(e) => {
                          setFieldValue("decision", e.target.value);
                          setDecision(e.target.value); // Update Toss prop with selected team
                          localStorage.setItem("decision", e.target.value); // Add this
                        }}
                        className={classes.radioGroup}
                      >
                        <FormControlLabel
                          value="bat"
                          control={<Radio />}
                          label="Bat"
                        />
                        <FormControlLabel
                          value="ball"
                          control={<Radio />}
                          label="Ball"
                        />
                      </RadioGroup>
                    </FormControl>
                  )}
                  <div>
                    <Button
                      variant="contained"
                      disabled={activeStep === 0}
                      onClick={() => setActiveStep((prev) => prev - 1)}
                      className={classes.backButton}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isLastStep() ? "Start" : "Next"}
                      {isLastStep() ? setGlobalstate(false) : ""}
                    </Button>
                  </div>
                </div>
              </form>
            );
          }}
        </Formik>
      </div>
      {/* Part C (About) */}
      <div className={classes.mainContainer3}>
        <p>{info?.names}</p>
      </div>
    </div>
  );
};

export default HorizontalStepper;
