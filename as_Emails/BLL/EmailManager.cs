using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using as_Emails.Models;
using as_Emails.BLL;

using System.Data.SqlClient;
using Dapper;
using System.Diagnostics;
using System.Configuration;
using System.Text.RegularExpressions;

namespace as_Emails.BLL
{
    public class EmailManager : IEmailManager
    {
        #region Setup
        private Repo repo = new Repo("core");
        private EmailSettings _emailSettings { get; set; }

        public static EmailSettings DefaultSettings = new EmailSettings
        {
            From = "myEmail@mail.com",
            To = "target@mail.com",
            Host = "smtp.yandex.ru",
            UserName = "myLoginName",
            Password = "some_password",
            Port = 465,
            IsSSL = true
        };

        public EmailManager(EmailSettings emailSettings)
        {
            _emailSettings = emailSettings;
        }
        #endregion

        public bool Send(string code, Dictionary<string, string> parameters, out string msg, string to = "", string from = "")
        {
            var res = false;
            msg = "";
            try
            {
                var email = _getSQLData(code);

                if (email != null)
                {
                    var body = Regex.Replace(msg, @"{param\d+}", x => parameters.ContainsKey(x.Value) ? parameters[x.Value] : x.Value);

                    msg = email.subject + "\n " + email.template;

                    var log = new EmailLogItem
                    {
                        created = DateTime.Now,
                        createdBy = "UserName",
                        emailID = email.id,
                        from = _emailSettings.From,
                        to = _emailSettings.To,
                        text = msg,
                        details = "Debug"
                    };

                    _sendEmailMessage(email.to, email.subject, body, email.bcc, email.cc);
                    res = true;
                }
                else { throw new Exception("Код не подходит ни к одному сообщению!"); }
            }
            catch (Exception e)
            {
                msg = "Ошибка отправки сообщения!\n" + e.ToString();
            }
            return res;
        }

        private void _sendEmailMessage(string to, string subject, string body, string bcc, string cc)
        {
            RDL.Email.SendMail(to, bcc, cc, subject, body);
            //RDL.Email.SendMail("wrkngbx@gmail.com", "", "", subject, body);
        }

        private EmailItem _getSQLData(string code)
        {
            EmailItem res;
            res = repo.GetSQLItem<EmailItem>("dbo.as_getMails", new { code });
            return res;
        }

        //private EmailItem _getEmailItem(string code)
        //{
        //    return new EmailItem { id = 1, code = "someCode", from = "myEmail@mail.com", to = "otherEmail@mail.com",
        //        subject = "Subject", template = "Message. Hello {param1} Welcome!", bcc = "myAnotherEmail@mail.com" };
        //}

        //private void _setSQLData(EmailLogItem log)
        //{
        //    if (log == null) return;
        //    string conString = ConfigurationManager.ConnectionStrings["core"].ConnectionString;
        //    using (var conn = new SqlConnection(conString))
        //    {
        //        conn.Open();
        //        var res = conn.Query("INSERT dbo.as_emailsLog VALUES (@date, @createdBy, @emailID, @text, @from, @to, @details)",
        //            new { date = log.created,log.createdBy, log.emailID, log.text, log.from, log.to, log.details } );
        //        Debug.Write(res);
        //    }
        //}
    }
}