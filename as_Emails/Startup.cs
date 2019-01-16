using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(as_Emails.Startup))]
namespace as_Emails
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
