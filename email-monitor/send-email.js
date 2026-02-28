const nodemailer = require('nodemailer');
const fs = require('fs');

const gmailPassword = fs.readFileSync('/data/secrets/gmail-app-password.txt', 'utf8').trim();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'thevisualbrandingexpert@gmail.com',
    pass: gmailPassword
  }
});

const mailOptions = {
  from: 'thevisualbrandingexpert@gmail.com',
  to: 'cflowers@faith-outreach.org',
  subject: 'RE: on-going projects',
  text: `Hi Dad,

Thank you for sending over the project list. I'm ready to move forward on these items and want to make sure I have everything clearly.

Here's what I'm capturing:

1. **25-slide deck with talking points** — I'll create this based on the 80-page ACS accreditation document. I'll reach out if I need to clarify any sections.

2. **Establish a publishing company** — I'm taking notes on this. Can you send me more details on the timeline and scope? Are we looking at a general blueprint or something we launch immediately?

3. **Bloomie for your books** — I can allocate one of my AI employees to help you write your two books. What's the timeline on this, and do you have an outline or topic breakdown ready?

4. **[Item #4 appears to be incomplete in your email]** — I noticed the last item didn't come through. Can you resend what you need for #4?

Once I hear back on these clarifications, I can get started right away.

God bless,
Kimberly`
};

transporter.sendMail(mailOptions, function(error, info) {
  if (error) {
    console.log('Error sending email:', error.message);
    process.exit(1);
  } else {
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    process.exit(0);
  }
});
