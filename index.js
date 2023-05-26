const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const moment = require("moment");
const nodemailer = require("nodemailer");

const app = express();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "anasalam027@gmail.com",
    pass: "yvbkuiovpwpfvtmq",
  },
});

app.use(express.static("./assets"));
app.use(express.json());

const template = (name) => {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, shrink-to-fit=no"
      />
      <title>Certificate</title>
      <style>
        * {
          padding: 0;
          margin: 0;
          box-sizing: border-box;
        }
        .parent-div {
          position: relative;
          width: 100%;
          height: 100%;
        }
        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .name {
          position: absolute;
          top: 46%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 100px;
          color: #01395e;
        }
        .underline {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          width: 100%;
          background-color: #01395e;
        }
        .date {
          position: absolute;
          font-size: 22px;
          bottom: 18.5%;
          left: 29%;
          color: #555;
        }
      </style>
    </head>
    <body>
      <div class="parent-div">
        <img
          src="https://i.postimg.cc/VL0mwkzQ/certificate.jpg"
          alt="certificate"
        />
        <h2 class="name">
          ${name}
          <span class="underline"></span>
        </h2>
        <h6 class="date">${moment().format("LL")}</h6>
      </div>
    </body>
  </html>
  `;
};

const generatePDF = async (name) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();

  const html = template(name);
  // await page.setContent(html, { waitUntil: "domcontentloaded" });

  // await page.emulateMediaType("screen");
  await page.goto(`data:text/html;charset=UTF-8,${encodeURIComponent(html)}`, {
    waitUntil: "networkidle0",
  });

  const pdf = await page.pdf({
    path: `result.pdf`,
    printBackground: true,
    format: "A4",
    landscape: true,
  });

  await browser.close();

  return pdf;
};

app.get("/",(req, res) =>{
  res.send("Welcome to FCCUmpire Server!")
})

app.post("/certificate", async (req, res) => {
  const { name, email } = req.body;

  const pdf = await generatePDF(name);

  const mailOptions = {
    from: { name: "Anas Alam", address: "anasalam027@gmail.com" },
    to: email,
    subject: "FCCUmpire - Certificate of Appreciation",
    text: `Please find your certificate below!`,
    // html: template(name),
    attachments: [
      {
        filename: `${name} certificate.pdf`,
        content: pdf,
      },
    ],
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.status(500).json(error);
    } else {
      console.log("Email sent: " + info.response);
      res.send("Mail sent!");
    }
  });
  res.status(200).send("Mail sent");
  // fs.writeFile(`${__dirname}/certifi/result.pdf`, pdf, function () {
  //   res
  //     .status(200)
  //     .download(`${__dirname}/certifi/result.pdf`, "certificate.pdf");
  // });
  //   res.status(200).send("fault");
});

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log("server running!"));
