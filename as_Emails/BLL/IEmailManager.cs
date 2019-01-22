using as_Emails.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace as_Emails.BLL
{
    public interface IEmailManager
    {
        bool Send(string code, out string msg, string to = "", string from = "", string subject = "", string body = "");
        EmailItem ShowMessage(string code, Dictionary<string, string> parameters, out string msg);

        IEnumerable<EmailItem> GetAllTemplates(out string msg);
        bool CreateNewMail(EmailItem email, out string msg);
        bool EditMail(int pk, string name, string value, out string msg);
        bool DeleteMail(int id, out string msg);
    }
}
