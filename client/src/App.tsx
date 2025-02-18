// import { useState } from "react";
import "./App.scss";
import docImg from "../src/assets/images/doc.png";

function App() {
  return (
    <>
      <div className="container">
        <header className="header">
          <h1 className="header__title">Resume Generator</h1>
        </header>
        <form action="" className="form">
          <div className="form-group">
            <label htmlFor="link" className="form-group__label">
              Job Posting URL
            </label>
            <input type="text" name="link" className="form-group__input" />

            <label htmlFor="resumeSubmitted" className="form-group__label">
              Choose your CV from device
            </label>
            <label htmlFor="resumeSubmitted" className="form-group__file-label">
              Choose file
            </label>
            <input
              type="file"
              name="resumeSubmitted"
              id="resumeSubmitted"
              className="form-group__file-input"
              accept="application/pdf"
            />

            <button type="submit" className="form-group__button">
              Generate
            </button>
          </div>
        </form>

        <div className="download-section">
          <h3>Download Word File</h3>
          <img
            src={docImg}
            alt="word file image"
            className="download-section__img"
          />
          {/* <div className="download-icon"></div> */}
        </div>
      </div>
    </>
  );
}

export default App;
