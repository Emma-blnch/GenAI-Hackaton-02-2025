<h1 align="center"> 💻 <strong>GenAI Hackaton by SIA Partners - February 2025</strong> </h1>

## 🏷️ **About the use case**
> Help a company with analyzing its media image by determining the tone and theme of media documents

Requirement: build an AI tool to help automate a time-consuming task. Use AWS tools to do it.

## 📥 **What I learned**
With this project, I developed my:
- [ ] Polyvalence.
- [ ] Teamwork/team spirit.
- [ ] Organization (having only 2 days to complete a big task).
- [ ] Oral skills (I presented our project in front of the jury in just 5 minutes).

## ⚙️ **Team**
The team was made up of 4 students from 42, Telecom Paris and CentralSupélec.

It was really interesting to work with students from other school because they have other specialties (such as mathematics) and a different approach to things.

# Architecture
![architechture](https://github.com/user-attachments/assets/82896281-f5ff-4c3d-b485-84ea8afb0c21)

As shown in the achitechture, the solution is a web application, screenshots of which are shown below.
When a PDF is uploaded we store it in a S3 bucket, call an API linked to a lambda function that will part the PDF in pages and then call another function linked to an AI model that will analyze the text and (not implemented on the website yet) return an excel sheet with the analysis and text.

![Enedis Analyzer-multiple](https://github.com/user-attachments/assets/590fdcf9-e7bd-4e3c-ab45-0459060fa633)

![Enedis Analyzer-single](https://github.com/user-attachments/assets/1f3e0665-7030-4ad9-b315-41d062c6725f)

## **User flow**
It was really important for me to focus on the user experience an dot make it smooth. The first page the user arrives to when opening the website is the data visualisation because I felt like that was what the company was missing the most: a clear representation of their media image in stats sorted by theme and region.

The other pages are dedicated to communicating articles to the IA for analyzing.

Overall the website was kept simple and clear, so the user can go straight to the point.
