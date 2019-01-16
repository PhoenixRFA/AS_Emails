using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace as_Emails.BLL
{
    interface IEmailManager
    {
        bool Send(string code, out string msg, string to = "", string from = "", string subject = "", string body = "");

        Models.EmailItem ShowMessage(string code, Dictionary<string, string> parameters, out string msg);
    }
}
