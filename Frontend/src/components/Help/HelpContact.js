import React, { useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Grid,
  Box,
  Chip,
  Divider,
  IconButton,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Support as SupportIcon,
  QuestionAnswer as FAQIcon,
  Send as SendIcon,
  WhatsApp as WhatsAppIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  SportsCricket as CricketIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  School as TutorialIcon,
  BugReport as BugIcon,
  Lightbulb as FeatureIcon,
} from "@mui/icons-material";
import "./HelpContact.css";
import Footer from "../Footer/Footer";
import photo from '../Image/Photo1.jpeg'; 

const HelpContact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const faqData = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I start a new match ?",
          answer:
            "To start a new match, click on the 'ADMIN' button on the homepage and enter the admin password. Once logged in, go to the 'Settings' section and click on 'NEW MATCH'. Follow the setup wizard to enter team names, add player details, and choose the match format. After completing the setup, click on 'START', and the new match will begin",
        },
        {
          question: "What information do I need to set up a match ?",
          answer:
            "You'll need to provide the team names, number of player, number of overs, and toss details. The system will guide you through each step of the setup process.",
        },
        {
          question: "What should I do after setting up the match ?",
          answer:
            "Once the match setup is complete, move to the 'Match' section to review and verify the entered details. After verification, go to the 'Live Score' section to monitor and update the match in real time. You can also view ongoing stats and progress in the 'Scoreboard' section. Make sure to follow the guidelines outlined in the Match Management section for smooth match operation.",
        },
      ],
    },
    {
      category: "Score Management",
      questions: [
        {
          question: "How do I record runs and wickets ?",
          answer:
            "Use the score keypad to click on run buttons (1, 2, 3, 4, 6) or the wicket button in 'Live Score' section. The system will automatically update the score, overs, and statistics in real-time.",
        },
        {
          question: "How do I handle extras (wides, no-balls) ?",
          answer:
            "Use score keypad to click on extra buttons (Wd, Nb, Lb) in 'Live Score' section in the score keypad to record wides, no-balls, byes, and leg byes. The system will automatically add the appropriate runs and update the extras count.",
        },
        {
          question: "Can I undo the last action ?",
          answer:
            "Yes, use the 'UNDO' button to reverse the last scoring action. This is useful for correcting mistakes during live scoring. You can undo multiple actions if needed.",
        },
      ],
    },
    {
      category: "Match Management",
      questions: [
        {
          question: "Can I edit match details after starting new match ?",
          answer:
            "Yes, you can edit match details through the 'livescore' section's admin panel. Click on options and use the edit functions to modify player details, match setup, current score using Keypad",
        },
        {
          question: "How do I view match statistics ?",
          answer:
            "Match statistics are displayed in real-time on the 'Scorecard'. You can also access detailed statistics including batting, bowling details through the admin panel.",
        },
        {
          question: "How do I reset the scoreboard ?",
          answer:
            "Use the 'NEW MATCH' or 'RESET' option in the 'Setting' section to reset the scoreboard and start a fresh match with new teams. This will clear all current match data.",
        },
      ],
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "What happens if I lose internet connection ?",
          answer:
            "The app works offline and will sync data when the connection is restored. All match data is stored locally for reliability, so you won't lose any information.",
        },
        {
          question: "How do I backup my match data ?",
          answer:
            "Match data is automatically saved to your device's local storage. For additional backup, you can export match reports through the developerl.",
        },
        {
          question: "Who do I contact for help or technical support ?",
          answer:
            "If you need assistance or encounter any issues, please reach out to the administrator through the 'Contact Us' section. Our team will ensure you receive seamless support and service.",
        },
      ],
    },
  ];

  const quickStartSteps = [
    {
      label: "START",
      description: 'Use "START" button on the homepage and enjoy live matches.',
      icon: <CricketIcon />,
    },
    {
      label: "TOSS",
      description: 'Use "TOSS" button to determine which team bats first.',
      icon: <SettingsIcon />,
    },
    {
      label: "HELP",
      description:
        'Use "HELP" button to get tips and real-time guidance about CrickApp.',
      icon: <PersonIcon />,
    },
    {
      label: "ADMIN",
      description:
        'Use "ADMIN" button to access controls  and monitor live matches in real-time.',
      icon: <TutorialIcon />,
    },
  ];

  const contactInfo = [
    {
      icon: <EmailIcon />,
      title: "Email Support",
      value: "ashutoshbirje04@gmail.com",
      description: "Get help via email within 24 hours",
      action: "Send Email",
    },
    {
      icon: <PhoneIcon />,
      title: "Phone Support",
      value: "+91 9322323582",
      description: "Call us for immediate assistance",
      action: "Call Now",
    },
    {
      icon: <WhatsAppIcon />,
      title: "WhatsApp Support",
      value: "+91 93223 23582",
      description: "Quick support via WhatsApp",
      action: "Chat on WhatsApp",
    },
    {
      icon: <LocationIcon />,
      title: "Office Address",
      value: "Baner, Pune",
      description: "Visit us for in-person support",
      action: "Get Directions",
    },
  ];

  const supportCategories = [
    {
      icon: <BugIcon />,
      title: "Technical Support",
      description:
        "Get help with app functionality, bugs, and technical issues",
      features: ["24/7 Support", "Bug Reports", "Performance Issues"],
      color: "#ef4444",
    },
    {
      icon: <TutorialIcon />,
      title: "User Guide",
      description: "Learn how to use all features of the cricket scoreboard",
      features: ["Step-by-step Tutorials", "Video Guides", "Best Practices"],
      color: "#3b82f6",
    },
    {
      icon: <FeatureIcon />,
      title: "Feature Requests",
      description: "Suggest new features and improvements for the app",
      features: ["New Features", "Improvements", "Feedback", "New Service"],
      color: "#10b981",
    },
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      setSnackbar({
        open: true,
        message: "Please fill in all fields",
        severity: "error",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSnackbar({
        open: true,
        message: "Please enter a valid email address",
        severity: "error",
      });
      return;
    }

    // Simulate form submission
    setSnackbar({
      open: true,
      message:
        "Thank you ! Your message has been sent successfully",
      severity: "success",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div className="help-contact-container">
      <AppBar position="fixed" className="appbar">
        <Toolbar>
          <Typography variant="h6">WELCOME</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" className="help-contact-content">
        {/* Header Section */}
        <Box className="header-section">
          <Typography variant="h2" className="page-title">
            Help & Support Center
          </Typography>
          <Typography variant="h6" className="page-subtitle">
            Everything you need to know about CrickApp
          </Typography>
        </Box>

        {/* Quick Start Guide */}
        <Card className="quick-start-card">
          <CardContent>
            <Box className="section-header">
              <CricketIcon className="section-icon" />
              <Typography variant="h4" className="section-title">
                Quick Start Guide
              </Typography>
            </Box>

            <Stepper orientation="vertical" className="quick-start-stepper">
              {quickStartSteps.map((step, index) => (
                <Step key={index} active={true}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box className="step-icon">{step.icon}</Box>
                    )}
                  >
                    <Typography variant="h6" className="step-title">
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body1" className="step-description">
                      {step.description}
                    </Typography>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Paper className="tabs-container">
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            className="help-tabs"
          >
            <Tab label="FAQ" icon={<FAQIcon />} />
            <Tab label="Contact Us" icon={<SupportIcon />} />
            <Tab label="Support" icon={<SettingsIcon />} />
          </Tabs>

          {/* FAQ Tab */}
          {activeTab === 0 && (
            <Box className="tab-content">
              <Grid container spacing={3}>
                {faqData.map((category, categoryIndex) => (
                  <Grid item xs={12} md={6} key={categoryIndex}>
                    <Card className="faq-category-card">
                      <CardContent>
                        <Typography variant="h5" className="category-title">
                          {category.category}
                        </Typography>
                        <Box className="faq-list">
                          {category.questions.map((faq, index) => (
                            <Accordion key={index} className="faq-accordion">
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                className="faq-question"
                              >
                                <Typography
                                  variant="h6"
                                  className="question-text"
                                >
                                  {faq.question}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails className="faq-answer">
                                <Typography variant="body1">
                                  {faq.answer}
                                </Typography>
                              </AccordionDetails>
                            </Accordion>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Contact Tab */}
          {activeTab === 1 && (
            <Box className="tab-content">
              <Grid container spacing={4}>
                {/* Contact Form */}
                <Grid item xs={12} lg={6}>
                    {/* Profile */}
                  <Card className="contact-form-card">
                    <CardContent>
                      <Box className="section-header">
                        <SupportIcon className="section-icon" />
                        <Typography variant="h4" className="section-title">
                          Profile
                        </Typography>
                      </Box>

                    {/* Circular Photos and Text */}
                    <div className="profile-container1">
                        <div>
                          <img
                            src={photo}
                            alt="Full Stack Developer"
                            className="circular-photo1"
                          />
                          
                          <Typography variant="h6" className="profile-name1" style={{ textAlign: 'center' }}>
  Ashutosh Birje
</Typography>
                        </div>
                    </div>
                          

                    </CardContent>
                    {/* Profile */}
                    <CardContent>
                      <Box className="section-header">
                        <SupportIcon className="section-icon" />
                        <Typography variant="h4" className="section-title">
                          Send us a Message
                        </Typography>
                      </Box>

                      <form onSubmit={handleSubmit} className="contact-form">
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Your Name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              variant="outlined"
                              required
                              className="form-field"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Email Address"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              variant="outlined"
                              required
                              className="form-field"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Subject"
                              name="subject"
                              value={formData.subject}
                              onChange={handleInputChange}
                              variant="outlined"
                              required
                              className="form-field"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Message"
                              name="message"
                              value={formData.message}
                              onChange={handleInputChange}
                              variant="outlined"
                              multiline
                              rows={4}
                              required
                              className="form-field"
                              placeholder="Describe your issue or question in detail..."
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Button
                              type="submit"
                              variant="contained"
                              size="large"
                              fullWidth
                              className="submit-button"
                              endIcon={<SendIcon />}
                            >
                              Send Message
                            </Button>
                          </Grid>
                        </Grid>
                      </form>
                    </CardContent>
                  </Card>
                </Grid>
                
                
                {/* Contact Information */}
                <Grid item xs={12} lg={6}>
                  <Card className="contact-info-card">
                    <CardContent>
                      <Box className="section-header">
                        <SupportIcon className="section-icon" />
                        <Typography variant="h4" className="section-title">
                          Get in Touch
                        </Typography>
                      </Box>
              
                      <List className="contact-list">
                        {contactInfo.map((contact, index) => (
                          <ListItem key={index} className="contact-list-item">
                            <ListItemIcon className="contact-icon-wrapper">
                              {contact.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography
                                  variant="h6"
                                  className="contact-title"
                                >
                                  {contact.title}
                                </Typography>
                              }
                              secondary={
                                <Box>
                                  <Typography
                                    variant="body1"
                                    className="contact-value"
                                  >
                                    {contact.value}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    className="contact-description"
                                  >
                                    {contact.description}
                                  </Typography>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    className="contact-action-button"
                                  >
                                    {contact.action}
                                  </Button>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>

                      <Divider className="divider" />

                      {/* Social Media Section */}
                      <Box className="social-section">
                        <Typography variant="h5" className="social-title">
                          Follow Us on Social Media
                        </Typography>
                        <Box className="social-links">
                          <IconButton
                            className="social-button facebook"
                            title="Facebook"
                          >
                            <FacebookIcon />
                          </IconButton>
                          <IconButton
                            className="social-button twitter"
                            title="Twitter"
                          >
                            <TwitterIcon />
                          </IconButton>
                          <IconButton
                            className="social-button instagram"
                            title="Instagram"
                          >
                            <InstagramIcon />
                          </IconButton>
                          <IconButton
                            className="social-button whatsapp"
                            title="WhatsApp"
                          >
                            <WhatsAppIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Support Categories Tab */}
          {activeTab === 2 && (
            <Box className="tab-content">
              <Grid container spacing={3}>
                {supportCategories.map((category, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Card className="support-category-card">
                      <CardContent className="text-center">
                        <Box
                          className="support-category-icon"
                          style={{ color: category.color }}
                        >
                          {category.icon}
                        </Box>
                        <Typography
                          variant="h5"
                          className="support-category-title"
                        >
                          {category.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          className="support-category-description"
                        >
                          {category.description}
                        </Typography>
                        <Box className="support-features">
                          {category.features.map((feature, featureIndex) => (
                            <Chip
                              key={featureIndex}
                              label={feature}
                              className="support-feature-chip"
                              size="small"
                            />
                          ))}
                        </Box>
                        <Button
                          variant="contained"
                          className="support-category-button"
                          style={{ backgroundColor: category.color }}
                        >
                          Get Help
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>
      </Container>

      {/* Snackbar for notifications */}
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

      <Footer></Footer>
    </div>
  );
};

export default HelpContact;
