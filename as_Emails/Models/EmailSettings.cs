using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace as_Emails.Models
{
    public struct EmailSettings
    {
        public string From { get; set; }
        public string To { get; set; }
        public string Host { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public int Port { get; set; }
        public bool IsSSL { get; set; }
    }
}