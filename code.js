const getProperty = (propertyName) =>
  PropertiesService.getScriptProperties().getProperty(propertyName);

const onSubmit = (e) => {
  const email = e.response.getRespondentEmail();
  const responses = e.response.getItemResponses();
  let firstName;
  let lastName;
  let parentName;
  let parentEmail;
  let age;
  for (const res of responses) {
    const question = res.getItem().getTitle();
    if (question.trim() === "First Name") {
      firstName = res.getResponse().trim();
    } else if (question.trim() === "Last Name") {
      lastName = res.getResponse().trim();
    } else if (question.trim() === "Parent/Guardian Name") {
      parentName = res.getResponse().trim();
    } else if (question.trim() === "Parent/Guardian Email") {
      parentEmail = res.getResponse().trim();
    } else if (question.trim() === "Age") {
      age = parseInt(res.getResponse().trim());
    }
  }
  const sendEmail = {
    url: "https://angelhacksba-mail.mliu.workers.dev",
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${getProperty("MAIL_AUTH_TOKEN")}`,
    },
    payload: JSON.stringify({
      email,
      textMessage: `Hey ${firstName}!

You're registered for AngelHacks Bay Area <https://angelhacksba.hackclub.com>; can't wait to see you there!

Next steps:
    - Sign the event liability waiver (sent to you in an email from RabbitSign).${
      age < 18
        ? " After you sign, your parent/guardian will receive an email to sign and complete the rest of the waiver."
        : ""
    }
    - Join the #angelhacks-ba channel in the Hack Club Slack to meet the other attendees --> https://hackclub.com/slack/?event=angelhacks-ba

AngelHacks BA will be May 27, 9am - 9pm at the Tully Branch Community Room -- bring your friends (🎨 artists, 🎵 musicians, 🎮 gamers, 💻 coders are all welcome)!

👾 AngelHacks BA Team`,
      htmlMessage: `<div>Hey ${firstName}!</div>
<br />
<div>
You're registered for <a href="https://angelhacksba.hackclub.com">AngelHacks Bay Area</a>; can't wait to see you there!
<br />
Next steps:
  <ul>
    <li>
      Sign the event liability waiver (sent to you in an email from RabbitSign).${
        age < 18
          ? " After you sign, your parent/guardian will receive an email to sign and complete the rest of the waiver."
          : ""
      }
    </li>
    <li>
      Join the #angelhacks-ba channel in the Hack Club Slack to meet the other attendees --> https://hackclub.com/slack/?event=angelhacks-ba
    </li>
  </ul>
</div>
<div>
AngelHacks BA will be May 27, 9am - 9pm at the Tully Branch Community Room -- bring your friends (🎨 artists, 🎵 musicians, 🎮 gamers, 💻 coders are all welcome)!
</div>
<br />
<div>
👾 AngelHacks BA Team
</div>`,
      subject: "👾 Thanks for registering for AngelHacks BA!",
    }),
  };

  const waiver = {
    url: age < 18 ? getProperty("MINOR_WAIVER") : getProperty("ADULT_WAIVER"),
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(
      age < 18
        ? {
            roles: {
              Participant: {
                email,
                name: `${firstName} ${lastName}`,
              },
              Parent: {
                email: parentEmail,
                name: parentName,
              },
            },
          }
        : {
            roles: {
              Participant: {
                email,
                name: `${firstName} ${lastName}`,
              },
            },
          }
    ),
  };
  UrlFetchApp.fetchAll([sendEmail, waiver]);
};
