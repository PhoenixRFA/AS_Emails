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
    public class EmailManager : IEmailManager, IEmailCRUDManager
    {
        #region Setup
        protected enum CRUDOperationType : byte { create, read, update, delete }

        private Repo repo;

        private EmailSettings _defaultSettings { get; set; } = new EmailSettings {

            From = "t.tempemail@yandex.ru",
            DisplayName = "Automatic Message Service",
            To = "",
            Subject = "Default subject",
            Host = "smtp.yandex.ru",
            UserName = "t.tempemail@yandex.ru",
            Password = "#Temp1mail",
            Port = 465,
            IsSSL = true
        };

        public EmailManager(string connString = null, EmailSettings emailSettings = null)
        {
            if (emailSettings != null) _defaultSettings = emailSettings;
            if (string.IsNullOrWhiteSpace(connString)) connString = "coreOffline";
            repo = new Repo(connString);
        }

        private string parametersSubstitution(string source, string regex, Dictionary<string, string> parameters)
        {
            return Regex.Replace(source, @"{\w+}", x => parameters.ContainsKey(x.Value) ? parameters[x.Value] : "");
        }
        #endregion

        public EmailItem ShowMessage(string code, Dictionary<string, string> parameters, out string msg)
        {
            msg = "";
            EmailItem email;

            try
            {
                if (!_hasAccessToSendEmail(code)) throw new Exception("Недостаточный уровень доступа!");
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
                email = null;
            }

            return email;
        }

        public bool Send(string code, out string msg, string to = "", string from = "", string subject = "", string body = "")
        {
            bool res;
            msg = "";
            try
            {
                if (!_hasAccessToSendEmail(code)) throw new Exception("Недостаточный уровень доступа!");
                var email = _getEmailItem(code);

                from = string.IsNullOrWhiteSpace(from) ? _defaultSettings.From : from.Trim();
                to = string.IsNullOrWhiteSpace(to) ? _defaultSettings.To : to.Trim();
                subject = string.IsNullOrWhiteSpace(subject) ? _defaultSettings.Subject : subject;
                //subject = System.Net.WebUtility.HtmlEncode(subject);
                //body = System.Net.WebUtility.HtmlEncode(body);

                email.from = from; email.to = to; email.subject = subject; email.template = body;

                //SendEmail(email.id, from, _defaultSettings.DisplayName, to, email.bcc, email.cc, subject, body, _defaultSettings.Host,
                //    _defaultSettings.UserName, _defaultSettings.Password, _defaultSettings.Port, getUserName(), _defaultSettings.IsSSL, "");

                SendEmail(email, _defaultSettings, _getUserName());

                res = true;
            }
            catch (Exception e)
            {
                msg = "Ошибка отправки сообщения!\n" + e.ToString();
                res = false;
            }
            return res;
        }

        public IEnumerable<EmailItem> GetAllTemplates(out string msg)
        {
            IEnumerable<EmailItem> res;
            msg = "";

            try
            {
                if (!_hasAccessToCRUD(CRUDOperationType.read)) throw new Exception("Недостаточный уровень доступа!");
                res = _getAllTemplates();
            }
            catch (Exception e)
            {
                msg = "Ошибка при получении шаблонов писем!\n" + e.ToString();
                res = null;
            }
            return res;
        }

        public IEnumerable<EmailItem> GetTemplatesWithPaging(int page, int pageSize, out string msg)
        {
            IEnumerable<EmailItem> res;
            msg = "";

            try
            {
                if (!_hasAccessToCRUD(CRUDOperationType.read)) throw new Exception("Недостаточный уровень доступа!");
                res = _getTemplatesWithPaging(page, pageSize);
            }
            catch(Exception e)
            {
                msg = "Ошибка при получении шаблонов писем!\n" + e.ToString();
                res = null;
            }
            return res;
        }

        public bool CreateNewMail(EmailItem email, out string msg)
        {
            bool res;
            msg = "";

            try
            {
                if (!_hasAccessToCRUD(CRUDOperationType.create)) throw new Exception("Недостаточный уровень доступа!");
                _createNewMail(email);
                res = true;
            }
            catch (Exception e)
            {
                msg = "Ошибка при создании шаблона письма!\n" + e.ToString();
                res = false;
            }
            return res;
        }

        public bool EditMail(int pk, string name, string value, out string msg)
        {
            bool res;
            msg = "";

            try
            {
                if (!_hasAccessToCRUD(CRUDOperationType.update)) throw new Exception("Недостаточный уровень доступа!");
                switch (name)
                {
                    case "code":
                        _editMail(pk, code: value);
                        break;
                    case "from":
                        _editMail(pk, from: value);
                        break;
                    case "to":
                        _editMail(pk, to: value);
                        break;
                    case "subject":
                        _editMail(pk, subject: value);
                        break;
                    case "template":
                        _editMail(pk, template: value);
                        break;
                    case "cc":
                        _editMail(pk, cc: value);
                        break;
                    case "bcc":
                        _editMail(pk, bcc: value);
                        break;
                }
                res = true;
            }
            catch (Exception e)
            {
                msg = "Ошибка при создании шаблона письма!\n" + e.ToString();
                res = false;
            }
            return res;
        }

        public bool DeleteMail(int id, out string msg)
        {
            bool res;
            msg = "";

            try
            {
                if (!_hasAccessToCRUD(CRUDOperationType.delete)) throw new Exception("Недостаточный уровень доступа!");
                _deleteMail(id);
                res = true;
            }
            catch (Exception e)
            {
                msg = "Ошибка при создании шаблона письма!\n" + e.ToString();
                res = false;
            }
            return res;
        }

        protected void SendEmail(EmailItem email, EmailSettings settings, string userName, string attach = "")
        {
            var builder = new BodyBuilder();
            MimeMessage mail = new MimeMessage();

            mail.From.Add(new MailboxAddress(settings.DisplayName, email.from));
            mail.To.Add(new MailboxAddress(email.to));
            mail.Subject = email.subject;
            builder.HtmlBody = email.template;
            mail.Body = builder.ToMessageBody();
            if (!string.IsNullOrWhiteSpace(email.bcc)) mail.Bcc.AddRange(email.bcc.Split(',').Select(x => { return new MailboxAddress(x.Trim()); }));
            if (!string.IsNullOrWhiteSpace(email.cc)) mail.Cc.AddRange(email.cc.Split(',').Select(x => { return new MailboxAddress(x.Trim()); }));

            using (var client = new MailKit.Net.Smtp.SmtpClient())
            {
                client.Connect(settings.Host, settings.Port, settings.IsSSL);
                client.AuthenticationMechanisms.Remove("XOAUTH2"); //' Do not use OAUTH2
                client.Authenticate(settings.UserName, settings.Password); //' Use a username / password to authenticate.
                client.Send(mail);
                client.Disconnect(true);
            }

            var log = new EmailLogItem
            {
                createdBy = _getUserName(),
                emailID = email.id,
                from = email.from,
                to = email.to,
                subject = email.subject,
                text = email.template,
                details = ""
            };
            _logEmail(log);
        }

        protected void SendEmail(int emailID, string from, string displayName, string to, string bcc, string cc, string subject, string body,
            string mailServer, string mailUsername, string mailPassword, int port, string userName, bool ssl = true, string attach = "")
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

            var log = new EmailLogItem
            {
                createdBy = _getUserName(),
                emailID = emailID,
                from = from,
                to = to,
                subject = subject,
                text = body,
                details = ""
            };
            _logEmail(log);
        }

        protected string _getUserName()
        {
            return HttpContext.Current.User.Identity.Name;
        }

        protected bool _hasAccessToSendEmail(string code)
        {
            return true;
        }

        protected bool _hasAccessToCRUD(CRUDOperationType operation)
        {
            switch (operation)
            {
                case CRUDOperationType.create:
                    return true;
                case CRUDOperationType.read:
                    return true;
                case CRUDOperationType.update:
                    return true;
                case CRUDOperationType.delete:
                    return true;
                default:
                    return false;
            }
        }

        private EmailItem _getEmailItem(string code)
        {
            EmailItem res;
            res = repo.GetSQLItem<EmailItem>("dbo.as_getMailsByCode", new { code });
            return res;
        }

        private void _logEmail(EmailLogItem log)
        {
            repo.GetSQLItem<string>("dbo.as_logMails", new { log.createdBy, log.emailID, log.subject, log.text, log.from, log.to, log.details });
        }

        private IEnumerable<EmailItem> _getTemplatesWithPaging(int page, int pageSize)
        {
            IEnumerable<EmailItem> res;
            res = repo.GetSQLItems<EmailItem>("dbo.as_getMailsWithPaging", new { PageNumber = page, PageSize = pageSize });
            return res;
        }

        private IEnumerable<EmailItem> _getAllTemplates()
        {
            IEnumerable<EmailItem> res;
            res = repo.GetSQLItems<EmailItem>("dbo.as_getAllMails");
            return res;
        }

        private void _createNewMail(EmailItem email)
        {
            repo.GetSQLItem<string>("dbo.as_CreateMail", new {email.code, email.template, email.subject, email.from, email.to, email.cc, email.bcc });
        }

        private void _editMail(int id, string code = null, string template = null, string subject = null, string from = null, string to = null, string cc = null, string bcc = null)
        {
            repo.GetSQLItem<string>("dbo.as_EditMail", new { id, code, template, subject, from, to, cc, bcc });
        }

        private void _deleteMail(int id)
        {
            repo.GetSQLItem<string>("dbo.as_DeleteMailById", new { id });
        }
    }

    public class AllowHtmlBinder : IModelBinder
    {
        public object BindModel(ControllerContext controllerContext,
            ModelBindingContext bindingContext)
        {
            var request = controllerContext.HttpContext.Request;
            var name = bindingContext.ModelName;
            return request.Unvalidated[name]; //magic happens here
        }
    }
}