using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace as_Emails.Models
{
    public class ApplicationContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationContext() : base("IdentityDb") { }

        public static ApplicationContext Create()
        {
            return new ApplicationContext();
        }
    }

    public class ApplicationManager : UserManager<ApplicationUser>
    {
        public ApplicationManager(IUserStore<ApplicationUser> store) : base(store) { }

        public static ApplicationManager Create(IdentityFactoryOptions<ApplicationManager> options, IOwinContext context)
        {
            ApplicationContext db = context.Get<ApplicationContext>();
            ApplicationManager manager = new ApplicationManager(new UserStore<ApplicationUser>(db));
            return manager;
        }
    }
}