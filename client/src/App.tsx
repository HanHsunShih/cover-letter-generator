// import { useState } from "react";
import "./App.scss";
import axios from "axios";
import docImg from "./assets/images/doc.png";
// import { getOpenAIResponse } from "../utils/apiUtils";
import { useEffect, useRef, useState } from "react";

function App() {
  const [result, setResult] = useState("");
  const jdInput = useRef<HTMLTextAreaElement>(null);
  const [jdErrorMessage, setJdErrorMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const apiUrl = import.meta.env.VITE_SERVER_URL;

  const handleJdOnChange = () => {
    setJdErrorMessage("");
  };

  const handleSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();

      if (!jdInput.current?.value.trim()) {
        setJdErrorMessage("Please paste job description");
        return;
      } else {
        const response = await axios.post(`${apiUrl}/openai`, {
          jobDescription: jdInput.current.value,
        });
        setResult(response.data.content);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleselectedFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <>
      <div className="container">
        <header className="header">
          <h1 className="header__title">Resume Generator</h1>
        </header>
        <form action="" className="form" onSubmit={handleSubmitForm}>
          <div className="form-group">
            <label htmlFor="jd" className="form-group__label">
              Paste Job Description
            </label>
            <textarea
              name="jd"
              rows={8}
              cols={50}
              className="form-group__input"
              placeholder="Paste Job Description here..."
              ref={jdInput}
              onChange={handleJdOnChange}
            />
            {jdErrorMessage && (
              <p className="form__error-message">{jdErrorMessage}</p>
            )}
            <label htmlFor="resumeSubmitted" className="form-group__label">
              Choose your CV from device
            </label>
            <label htmlFor="resumeSubmitted" className="form-group__file-label">
              {fileName ? `Change File` : `Choose file`}
            </label>
            {fileName && <p className="form__file-name">Your CV: {fileName}</p>}
            <input
              type="file"
              name="resumeSubmitted"
              id="resumeSubmitted"
              className="form-group__file-input"
              accept="application/pdf"
              onChange={handleselectedFile}
            />
            <button type="submit" className="form-group__button">
              Generate
            </button>
          </div>
        </form>

        <div className="download-section">
          {result && <p>{result}</p>}
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
