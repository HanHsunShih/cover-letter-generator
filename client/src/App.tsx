import "./App.scss";
import axios from "axios";
import docImg from "./assets/images/doc.png";
import { useRef, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
// @ts-ignore
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
// @ts-ignore
import "pdfjs-dist/legacy/build/pdf.worker";

function App() {
  const [result, setResult] = useState("");
  const [showIcon, setShowIcon] = useState(false);
  const jdInput = useRef<HTMLTextAreaElement>(null);
  const cvInput = useRef<HTMLInputElement>(null);
  const [jdErrorMessage, setJdErrorMessage] = useState("");
  const [cvErrorMessage, setCvErrorMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const [loadingGif, setLoadingGif] = useState(false);
  const apiUrl = import.meta.env.VITE_SERVER_URL;

  const handleJdOnChange = () => {
    setJdErrorMessage("");
  };

  const handleSelectedFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setFileName(file.name);
      setCvErrorMessage("");
    }
  };

  const GetPdfContent = async (
    src:
      | string
      | Uint8Array
      | ArrayBuffer
      | pdfjsLib.PDFDataRangeTransport
      | pdfjsLib.DocumentInitParameters
  ) => {
    const doc = await pdfjsLib.getDocument(src).promise;
    const page = await doc.getPage(1);
    return await page.getTextContent();
  };

  const getPdfItem = async (
    src:
      | string
      | Uint8Array
      | ArrayBuffer
      | pdfjsLib.PDFDataRangeTransport
      | pdfjsLib.DocumentInitParameters
  ) => {
    const content = await GetPdfContent(src);
    const items = content.items.map((item: pdfjsLib.TextItem) => {
      // console.log("item.str: ");
      // console.log(item.str);
      return item.str;
    });

    return items;
  };

  const readFileAsText = (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const extractedText = await getPdfItem(arrayBuffer);
        resolve(extractedText);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      if (showIcon === false) {
        event.preventDefault();
        let hasError = false;

        if (!jdInput.current?.value.trim()) {
          setJdErrorMessage("Please paste job description");
          hasError = true;
        }

        const file = cvInput.current?.files?.[0];
        if (!file) {
          setCvErrorMessage("Please upload your resume as a PDF file");
          hasError = true;
        }

        if (hasError) return;

        setLoadingGif(true);

        const cvResponse = await readFileAsText(file!);
        const extractText = cvResponse.join("");

        const response = await axios.post(`${apiUrl}/openai`, {
          jobDescription: jdInput.current?.value,
          cvContent: extractText,
        });

        console.log(
          "response.data.extractedInfo:" + response.data.extractedInfo
        );

        setLoadingGif(false);
        setShowIcon((prev) => !prev);
      } else {
        event.preventDefault();
        setShowIcon((prev) => !prev);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDownloadFile = async (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    try {
      event.preventDefault();

      const response = await axios.get(`${apiUrl}/download`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "cover-letter.docx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("File download failed:", error);
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
            <p className="form__error-message">{jdErrorMessage || "\u00A0"}</p>

            {/* {jdErrorMessage && (
              <p className="form__error-message">{jdErrorMessage}</p>
            )} */}
            <label htmlFor="resumeSubmitted" className="form-group__label">
              Choose your CV from device
            </label>
            <label htmlFor="resumeSubmitted" className="form-group__file-label">
              {fileName ? `Change File` : `Choose file`}
            </label>
            {!fileName ? (
              <p className="form__error-message">
                {cvErrorMessage || "\u00A0"}
              </p>
            ) : (
              <p className="form__file-name">{fileName}</p>
            )}
            <input
              type="file"
              name="resumeSubmitted"
              id="resumeSubmitted"
              className="form-group__file-input"
              accept="application/pdf"
              onChange={handleSelectedFile}
              ref={cvInput}
            />
            <button type="submit" className="form-group__button">
              {showIcon ? `Generate Another One` : `Generate`}
            </button>
          </div>
        </form>
        {loadingGif && (
          <DotLottieReact
            src="https://lottie.host/632e723c-779b-4d68-9f03-f561424e0652/TYs70iacrm.lottie"
            loop
            autoplay
            className="download-section__loading-icon"
          />
        )}
        {showIcon && (
          <div className="download-section">
            {result && <p>{result}</p>}
            <h3 className="download-section__text">Download Word File</h3>
            <a href="" onClick={handleDownloadFile}>
              <img
                src={docImg}
                alt="word file image"
                className="download-section__img"
              />
            </a>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
