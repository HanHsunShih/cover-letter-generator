// import { useState } from "react";
import "./App.scss";
import axios from "axios";
import docImg from "./assets/images/doc.png";
import { getOpenAIResponse } from "../utils/apiUtils";
import { useEffect, useRef, useState } from "react";

function App() {
  const [result, setResult] = useState("");
  const jdInput = useRef<HTMLInputElement>(null);
  const [jdErrorMessage, setJdErrorMessage] = useState("");

  const responseRender = async () => {
    try {
      const response = await getOpenAIResponse();
      setResult(response.content);
    } catch (error) {
      console.log(error);
    }
  };

  const handleJdOnChange = () => {
    setJdErrorMessage("");
  };

  console.log("result: ");
  console.log(result);

  const handleSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();

      if (!jdInput.current?.value.trim()) {
        setJdErrorMessage("Please paste job description");
      } else {
        // axios.
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    responseRender();
  }, []);

  return (
    <>
      <div className="container">
        <header className="header">
          <h1 className="header__title">Resume Generator</h1>
        </header>
        <form action="" className="form" onSubmit={handleSubmitForm}>
          <div className="form-group">
            <label htmlFor="link" className="form-group__label">
              Paste Job Description
            </label>
            <input
              type="text"
              name="link"
              className="form-group__input"
              ref={jdInput}
              onChange={handleJdOnChange}
            />
            {jdErrorMessage && (
              <p className="form__errorMessage">{jdErrorMessage}</p>
            )}
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
