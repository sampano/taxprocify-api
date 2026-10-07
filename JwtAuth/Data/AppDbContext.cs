using JwtAuth.Entities;
using Microsoft.EntityFrameworkCore;

namespace JwtAuth.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        // create users table represent user class
        public DbSet<User> Users { get; set; }

        // create clients table represent client class
        public DbSet<Client> Clients { get; set; }
    }
}
