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

        // create taxcases table represent taxcase class
        public DbSet<TaxCase> TaxCases { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<TaxCase>()
                .Property(taxCase => taxCase.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Document>()
                .HasOne(document => document.UploadedByUser)
                .WithMany(user => user.Documents)
                .HasForeignKey(document => document.UploadedByUserId)
                .OnDelete(DeleteBehavior.NoAction);
        }

        public DbSet<Document> Documents { get; set; }
    }
}
