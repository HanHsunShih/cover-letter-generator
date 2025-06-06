# Cover Letter Generator


## Live DEMO
https://amys-cover-letter-generator.netlify.app/

Generate bespoke cover letter by only 2 steps! 
1. Paste job description
2. upload resume



A bespoke AI-powered resume generator using React, Node.js, and OpenAI API, streamlining the job application process. Enabled automated PDF resume analysis and job description matching, generating tailored Word documents for seamless downloads.

![Image](https://github.com/user-attachments/assets/9cdefec6-a59c-4f27-8e23-05f5e54cba05)
<img width="635" alt="Image" src="https://github.com/user-attachments/assets/0e850478-60c5-47d3-a611-35c17826dca0" />


## About this project
Recently I'm actively searching for a job and noticed many companies require a cover letter to showcase my passion and willingness to work with them. I always need to carefully read the job description, combine key points with my experience and passion, spending approximately 1 hour on each letter.

So, I decided to solve this problem using my technical skills 🤓. In this project, users can paste a job description and upload their CV. Using the OpenAI API, the app generates a bespoke cover letter tailored to the job.

<img width="635" alt="Image" src="https://github.com/user-attachments/assets/9f363460-80b3-43ed-aa55-a7d835f7e822" />


## Features
- Convert the user-uploaded resume from PDF to an ArrayBuffer using the npm package [pdfjs-dist](https://www.npmjs.com/package/pdfjs-dist)
- Analyzes user's resume and job description using [OpenAI API](https://platform.openai.com/docs/overview)
- Generates a bespoke cover letter tailored to the specific job
- Uses the npm package [docx](https://docx.js.org/#/?id=welcome) to allow users to download the cover letter as a Word document.

## Build with
<p align="left">
  <a href="https://www.w3.org/html/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original-wordmark.svg" alt="html5" width="40" height="40"/> </a> 
  <a href="https://www.w3schools.com/css/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original-wordmark.svg" alt="css3" width="40" height="40"/> </a> 
  <a href="https://sass-lang.com" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/sass/sass-original.svg" alt="sass" width="40" height="40"/> </a>
  <a href="https://reactjs.org/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original-wordmark.svg" alt="react" width="40" height="40"/> </a> 
  <a href="https://nodejs.org" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original-wordmark.svg" alt="nodejs" width="40" height="40"/> </a> 
  <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noreferrer"> <img src="https://github.com/tandpfun/skill-icons/blob/main/icons/TypeScript.svg" alt="typescript" width="40" height="40"/> </a> 
  <a href="https://www.mysql.com/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mysql/mysql-original-wordmark.svg" alt="mysql" width="40" height="40"/> </a> 
  <a href="https://postman.com" target="_blank" rel="noreferrer"> <img src="https://www.vectorlogo.zone/logos/getpostman/getpostman-icon.svg" alt="postman" width="40" height="40"/> </a> 
  <a href="https://git-scm.com/" target="_blank" rel="noreferrer"> <img src="https://www.vectorlogo.zone/logos/git-scm/git-scm-icon.svg" alt="git" width="40" height="40"/> </a> 
</p>

## Getting Started 🚀

### Create your own openAI API key
- Create new secret key from this [link](https://platform.openai.com/settings/organization/api-keys)

### Prerequisities
- npm
  ```
  npm install npm@latest -g
  ```
  
### Installation
- clone the repo
  ```
  git clone https://github.com/HanHsunShih/cover-letter-generator.git
  ```
- install NPM packages
  ```
  npm install
  ```
- follow the **.env.sample** file to create the .env file


## Usage
1. Paste the job description into the provided field.
2. Upload your resume (CV).
3. Click "Generate" to create a bespoke cover letter.
4. Download your generated cover letter as a Word document to your download folder.
