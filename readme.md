# Readme
Easy way to run group mail on Your server.

# Install

    1. npm install js_group_mail
    2. add to mysql database aliases table
    3. insert to table the rows
        3.1 mail_from - sender mail, unique, ex. test@mail.com
        3.2 mail_to   - json, send to mails, ex. {"test1@mail.com", "test2@mail.com"}
        3.3 is_on     - bool, 1 where the group mail will works
    4. edit the config/config.js file
    5. add in Your provider single e-mail alias to Your mail_login from config.js file
    6. npm install
    7. node app.js
     