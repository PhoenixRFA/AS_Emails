using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace as_Emails.Models
{
    public class EmailLogItem
    {
        public int id { get; set; }
        public DateTime created { get; set; }
        public string createdBy { get; set; }
        public int emailID { get; set; }
        public string subject { get; set; }
        public string text { get; set; }
        public string from{ get; set; }
        public string to { get; set; }
        public string details { get; set; }
    }
}