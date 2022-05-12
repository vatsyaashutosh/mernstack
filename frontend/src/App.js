import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import Header from "./component/layout/Header.js";
import WebFont from "webfontloader";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    WebFont.load({
      google: {
        families: ["Roboto", "Droid Sans", "Chilanka"],
      },
    });
  });
  return (
    <Router>
      <Header />
    </Router>
  );
}

export default App;
