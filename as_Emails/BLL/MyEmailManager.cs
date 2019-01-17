using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using as_Emails.Models;

namespace as_Emails.BLL
{
    public class MyEmailManager : EmailManager
    {
        public MyEmailManager(EmailSettings settings = null) : base(settings) { }

        public new EmailItem ShowMessage(string code, Dictionary<string, string> parameters, out string msg)
        {
            msg = "";
            return new EmailItem()
            {
                from = "myEmail@gmail.com",
                to = "target@gmail.com",
                template = "My template.",
            };
        }

        public new bool Send(string code, out string msg, string to = "", string from = "", string subject = "", string body = "")
        {
            _sendAsSMS();
            msg = "Смс успешно отправлено!";
            return true;
        }

        protected new bool _hasAccess()
        {
            return true;
        }

        protected new string _getUserName()
        {
            return "admin";
        }

        private void _sendAsSMS()
        {

        }
    }
}