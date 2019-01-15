using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace as_Emails.Models
{
    public class EmailItem
    {
        public int id { get; set; }
        public string code { get; set; }
        public string template { get; set; }
        public string subject { get; set; }
        public string from { get; set; }
        public string to { get; set; }
        public string cc { get; set; }
        public string bcc { get; set; }
    }
}