# Angular Patient Management System

A modern Angular 17 application for managing patients and their visits, built with Angular Material and TypeScript.

## 🚀 Installation Guide

### Prerequisites
- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

### Step 1: Download and Extract
1. Download the project files
2. Extract to a folder on your computer
3. Open terminal/command prompt in that folder

### Step 2: Install Dependencies
\`\`\`bash
# Install all required packages
npm install
\`\`\`

### Step 3: Start the Application
\`\`\`bash
# Start the development server
npm start
\`\`\`

The application will automatically open in your browser at `http://localhost:4200`

## 🛠️ Available Commands

\`\`\`bash
# Start development server (opens browser automatically)
npm start

# Start development server (manual browser opening)
ng serve

# Build for production
npm run build

# Run tests
npm test
\`\`\`

## 🌟 Features

- ✅ **100% Pure Angular** - No React or Next.js components
- ✅ **Modern UI** - Angular Material design matching your reference
- ✅ **Patient Management** - Add, edit, view, delete patients
- ✅ **Visit Tracking** - Record and manage patient visits
- ✅ **Dashboard** - Statistics and overview
- ✅ **Responsive** - Works on desktop and mobile
- ✅ **TypeScript** - Type-safe development

## 📁 Project Structure

\`\`\`
angular-patient-management/
├── src/
│   ├── app/
│   │   ├── features/
│   │   │   ├── dashboard/           # Dashboard component
│   │   │   ├── patients/            # Patient management
│   │   │   └── visits/              # Visit management
│   │   ├── shared/
│   │   │   ├── models/              # TypeScript interfaces
│   │   │   └── services/            # Angular services
│   │   ├── app.component.ts         # Root component
│   │   └── app.routes.ts            # Angular routing
│   ├── styles.scss                  # Global styles
│   ├── main.ts                      # Angular bootstrap
│   └── index.html                   # Main HTML file
├── angular.json                     # Angular configuration
├── package.json                     # Dependencies
└── tsconfig.json                    # TypeScript config
\`\`\`

## 🔧 Troubleshooting

### If you get "ng command not found":
\`\`\`bash
# Install Angular CLI globally
npm install -g @angular/cli
\`\`\`

### If port 4200 is already in use:
\`\`\`bash
# Use a different port
ng serve --port 4201
\`\`\`

### If you have dependency issues:
\`\`\`bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
\`\`\`

## 🎯 What You'll See

1. **Dashboard**: Statistics and recent activity
2. **Patients**: List of patients with search functionality
3. **Add Patient**: Form to add new patients
4. **Visits**: All visits with filtering options
5. **Add Visit**: Form to record new visits

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚀 Deployment

### Build for Production
\`\`\`bash
npm run build
\`\`\`
Files will be in the `dist/` folder.

### Deploy to Vercel
\`\`\`bash
npm install -g vercel
vercel
\`\`\`

### Deploy to Netlify
1. Run `npm run build`
2. Upload the `dist/angular-patient-management` folder to Netlify

This is now a **100% pure Angular application** with no React or Next.js components! 🎉
