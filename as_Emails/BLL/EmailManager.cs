using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using as_Emails.Models;
using as_Emails.BLL;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using System.Data.SqlClient;
using Dapper;
using System.Diagnostics;
using System.Configuration;
using System.Text.RegularExpressions;
using MimeKit;

namespace as_Emails.BLL
{
    public class EmailManager : IEmailManager
    {
        #region Setup
        private Repo repo = new Repo("core");

        private EmailSettings _defaultSettings { get; set; } = new EmailSettings {

            From = "phoenix.rfa@yandex.ru",
            DisplayName = "Automatic Message Service",
            To = "gralukkr@gmail.com",
            Subject = "Default subject",
            Host = "smtp.yandex.ru",
            UserName = "phoenix.rfa@yandex.ru",
            Password = "cmfumlpwxpgaxkyx",
            Port = 465,
            IsSSL = true
        };

        public EmailManager(EmailSettings emailSettings = null)
        {
            if (emailSettings != null) _defaultSettings = emailSettings;
        }

        private string parametersSubstitution(string source, string regex, Dictionary<string, string> parameters)
        {
            return Regex.Replace(source, @"{\w+}", x => parameters.ContainsKey(x.Value) ? parameters[x.Value] : "");
        }
        #endregion

        public EmailItem ShowMessage(string code, Dictionary<string, string> parameters, out string msg)
        {
            msg = "";
            EmailItem email = null;

            try
            {
                email = _getEmailItem(code);

                if (email != null)
                {
                    email.subject = parametersSubstitution(email.subject, @"{\w+}", parameters);
                    email.template = parametersSubstitution(email.template, @"{\w+}", parameters);
                }
                else { throw new Exception("Код не подходит ни к одному сообщению!"); }
            }
            catch(Exception e)
            {
                msg = "Ошибка получения шаблона сообщения!\n" + e.ToString();
            }

            return email;
        }

        public bool Send(string code, out string msg, string to = "", string from = "", string subject = "", string body = "")
        {
            var res = false;
            msg = "";
            try
            {
                var email = _getEmailItem(code);

                from = string.IsNullOrWhiteSpace(from) ? _defaultSettings.From : from;
                to = string.IsNullOrWhiteSpace(to) ? _defaultSettings.To : to;
                subject = string.IsNullOrWhiteSpace(subject) ? _defaultSettings.Subject : subject;

                SendEmail(from, _defaultSettings.DisplayName, to, email.bcc, email.cc, subject, body, _defaultSettings.Host,
                    _defaultSettings.UserName, _defaultSettings.Password, _defaultSettings.Port, _defaultSettings.IsSSL, "");

                var log = new EmailLogItem
                {
                    createdBy = getUserName(),
                    emailID = email.id,
                    from = from,
                    to = to,
                    subject = subject,
                    text = body,
                    details = ""
                };
                _logEmail(log);

                res = true;
            }
            catch (Exception e)
            {
                msg = "Ошибка отправки сообщения!\n" + e.ToString();
            }
            return res;
        }

        protected void SendEmail(string from, string displayName, string to, string bcc, string cc, string subject, string body,
            string mailServer, string mailUsername, string mailPassword, int port, bool ssl = true, string attach = "")
        {
            var builder = new BodyBuilder();
            MimeMessage mail = new MimeMessage();
            
            mail.From.Add(new MailboxAddress(displayName, from));
            mail.To.Add(new MailboxAddress(to));
            mail.Subject = subject;
            builder.HtmlBody = body;
            mail.Body = builder.ToMessageBody();
            if (!string.IsNullOrWhiteSpace(bcc)) mail.Bcc.AddRange(bcc.Split(',').Select(x => { return new MailboxAddress(x.Trim()); }));
            if (!string.IsNullOrWhiteSpace(cc)) mail.Cc.AddRange(cc.Split(',').Select(x => { return new MailboxAddress(x.Trim()); }));

            using (var client = new MailKit.Net.Smtp.SmtpClient())
            {
                client.Connect(mailServer, port, ssl);
                client.AuthenticationMechanisms.Remove("XOAUTH2"); //' Do not use OAUTH2
                client.Authenticate(mailUsername, mailPassword); //' Use a username / password to authenticate.
                client.Send(mail);
                client.Disconnect(true);
            }
        }

        protected string getUserName()
        {
            return HttpContext.Current.User.Identity.Name;
        }

        private EmailItem _getEmailItem(string code)
        {
            EmailItem res;
            res = repo.GetSQLItem<EmailItem>("dbo.as_getMails", new { code });
            return res;
        }

        private void _logEmail(EmailLogItem log)
        {
            repo.GetSQLItem<string>("dbo.as_logMails", new { log.createdBy, log.emailID, log.subject, log.text, log.from, log.to, log.details });
        }
    }
}