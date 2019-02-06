# Happenings App

This project demonstrates a basic event/scheduling app suitable for personal or organizational use. It expands (and relies on) the .NET Core Happenings project [(here)](https://github.com/DistantEye/HappeningsDotNetC). The goal is to provide a richer and more responsive interface over the original project prototype that shipped with that backend.

## Requirements

The project is built ontop of React, with react-bootstrap, react-router, and webpack as the other major components.
Everything should pull down and install easily from NPM.

Note that the above linked .NET backend will need to be running for the project to function. Adjust ```REACT_APP_BACKEND_URL``` in the .env file to point to appropiate URL (make sure to include /api in the path)

## Running Commands

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

#### `npm test`

Launches the test runner in the interactive watch mode.<br>

Note that jest tests aren't implemented currently and are just included from the scaffold

#### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>

## Notes

As with the .NET project, there are some considerations on where this project could/should grow if was being done as a full-fledged work rather than a sample:

* First and foremost, sockets should be used rather than the constant polling model used to obtain User/Login data as well as updating the reminder count
* Redux wasn't used for this project. It might be that the scope was small enough not to need it, but I know if I was in the seat of a developer coming onboard the project, I'd want to run the analysis on whether it could help improve things through its inclusion
* While the overall UI is much more responsive and slightly more pleasing visually than the .NET interface, there's still room for improvement
    * Pages should have loading placeholder panels instead of components simply returning null when data hasn't loaded
    * Edges should be stylized a bit to liven up the relatively flat appearance
    * Spacing and alignment on UI elements should be adjusted. There are a few different schools of thought for UI design and the current placements don't quite match either of them
* Jest tests aren't implemented beyond the placeholder. In a larger project, we'd want something for regression testing
* There is some semblance of Responsive Design in the the Navbar and Calendar Page, but there is room for a lot more
