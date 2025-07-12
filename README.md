# React + Vite Template

A modern React template for web applications and games, featuring React 18, Vite, TailwindCSS, and Material UI.
You can see the demo here: https://skygroud.com/fuel-consumption-tracker/

## Project Structure

```
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles (Tailwind)
├── public/              # Static assets
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
└── eslint.config.js     # ESLint configuration
```

## Development Guidelines

- Modify `index.html` and `src/App.jsx` as needed
- Create new folders or files in `src/` directory as needed
- Style components using TailwindCSS utility classes
- Avoid modifying `src/main.jsx` and `src/index.css`
- Only modify `vite.config.js` if absolutely necessary

## Available Scripts
- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Lint source files

## Tech Stack

- React
- Vite
- TailwindCSS
- ESLint
- Javascript

## Run the Project in dev env
### Frontend
1. cd /Fuel-Consumption-Tracker/frontend
2. npm install
3. npm run dev

### Backend
1. Go to Google Auth Platform and  create an OAuth 2.0 Client ID.
2. Create .env file in project backend root folder, and then configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SECRET_KEY (These three variables are from Google Aouth Client secret key) and ALLOW_ORIGIN.
3. Run the app by using VS code


## How to Deploy
1. Make sure your server has installed nodejs&npm.
```
# These commands are for ubuntu
sudo apt remove nodejs npm -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
source ~/.bashrc
nvm install 22
node -v
npm -v
```
2. Compile frontend
```
cd frontend
npm install
npm run build
```
3. Install package for backend
```

npm install express body-parser cors passport passport-google-oauth20 jsonwebtoken dotenv
```
5. Run the application
```
nohup node src/app.js > output.log 2>&1 &
```
