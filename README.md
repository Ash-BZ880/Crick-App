# 🏏 Crick_App – Real-Time Cricket Scoring App 🏏

## 📚 Project Domain
**Domain**: Sports Management & Live Scoring  
**Tech Stack**: MERN (MongoDB, Express.js, React.js, Node.js)

## 🧩 Problem Statement
Gully and grassroots cricket lack proper digital tools for live score management. Organizers often rely on manual methods, leading to errors, poor engagement, and no player history. There's also no platform to showcase local sponsors or advertisements.

CrickApp solves this by offering a real-time scoring app for local matches, with features for score updates, player stats, and in-app ad placements—connecting sports and local businesses in one platform.

## 💡 Project Idea

CrickApp is a dynamic and interactive cricket scoring application built for real-time match tracking. It allows authenticated admins to create matches, update live scores, and manage player statistics, while users can view live updates, detailed scorecards, and historical match data. The platform supports user-friendly interface and instant data refresh, CrickApp delivers a responsive and engaging experience for both cricket fans and match administrators.

## ✨ Features

### 👨‍💼 Admin Side 
- Secure login and admin dashboard 
- Create new matches with team and other inputs
- Toss and inning management
- Ball-by-ball score entry with keyboard and UI support
- Save match data and manage intervals
- User ID : admin | Password : 12345

### 👤 User Side
- Live score viewing
- Match summaries and stats
- Responsive and clean interface

### 🧾 Others
- Help center with screenshots and shortcuts
- Interval timer and score preview
- Save match state for future review

## 📁 Folder Overview

```
CrickApp/
├── backend/         # Node.js + Express backend
├── frontend/        # React.js frontend
├── images/          # Screenshots and UI assets
└── README.md        # Project documentation
```

## 🛠️ Getting Started

Follow the steps below to run the project locally:

### 🧬 Clone the Repository
```bash
git clone https://github.com/your-username/CrickApp.git
cd CrickApp
```

### ⚙️ Run Backend
```bash
cd backend
npm install
set NODE_OPTIONS=--openssl-legacy-provider
npm start
```

### 💻 Run Frontend
```bash
cd ../frontend
npm install
set NODE_OPTIONS=--openssl-legacy-provider
npm start
```

> ⚠️ On Unix-based systems (Linux/macOS), use:
```bash
export NODE_OPTIONS=--openssl-legacy-provider
```

## 🔁 Project Workflow

- **Admin Login**: Secure entry for authorized personnel  
- **Match Creation**: Add match details, teams, and players  
- **Toss Screen**: Choose toss winner and decision  
- **Form Setup**: Input players for both teams  
- **Match Start**: Enter scores ball-by-ball using keyboard or UI  
- **Interval**: Break between innings  
- **Second Innings**: Score entry continues  
- **Save Match**: Finalize match and store data  
- **User View**: View scores live with historical data  
- **Help Center**: Instructions and screenshots  

## 🖼️ Screenshot Preview

HOME
![CrickApp UI Preview](./Images/Home.png)

TOSS
![CrickApp UI Preview](./Images/TOSS.png)

HELP 
![CrickApp UI Preview](./Images/HELP_1.png)
![CrickApp UI Preview](./Images/HELP_2.png)
![CrickApp UI Preview](./Images/HELP_3.png)
![CrickApp UI Preview](./Images/HELP_4.png)

ADMIN MODE
![CrickApp UI Preview](./Images/ADMIN_1.png)
![CrickApp UI Preview](./Images/ADMIN_2.png)

USER MODE
![CrickApp UI Preview](./Images/USER_2.png)
![CrickApp UI Preview](./Images/USER_1.png)

NEW-MATCH 
![CrickApp UI Preview](./Images/FORM_1.png)
![CrickApp UI Preview](./Images/FORM_2.png)
![CrickApp UI Preview](./Images/FORM_3.png)
![CrickApp UI Preview](./Images/FORM_4.png)
![CrickApp UI Preview](./Images/FORM_5.png)

ADMIN-VIEW
![CrickApp UI Preview](./Images/ADMIN_3.png)
![CrickApp UI Preview](./Images/ADMIN_4.png)
![CrickApp UI Preview](./Images/ADMIN_5.png)

KEYBOARD
![CrickApp UI Preview](./Images/KEYBORAD.png)

USER-VIEW
![CrickApp UI Preview](./Images/NEW_MATCH.png)

INNING-1
![CrickApp UI Preview](./Images/INNING_1.png)
![CrickApp UI Preview](./Images/INNING_1_SCORE.png)

INTERVAL (USER-MODE)
![CrickApp UI Preview](./Images/INTERVAL_1.png)

INTERVAL (ADMIN-MODE)
![CrickApp UI Preview](./Images/INTERVAL_2.png)

INNING-2
![CrickApp UI Preview](./Images/INNING_2.png)
![CrickApp UI Preview](./Images/INNING_2_SCORE.png)

SCORE-CARD
![CrickApp UI Preview](./Images/SAVE.png)

## 🔮 Future Enhancements

- Player statistics graphs and analysis 
- Export match reports to PDF  
- Pointable for matches and tournament 

## 👨‍💻 Author

**Ashutosh Birje**  
📧 [Email](ashutoshbirje880@gmail.com) 
🔗 [LinkedIn](https://www.linkedin.com/in/ashutosh-birje-246453263/)  
🌐 [Portfolio](https://ashutoshbirje.netlify.app/)
