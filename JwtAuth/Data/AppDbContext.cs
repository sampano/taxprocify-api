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

            // Admin/Tax Professional who owns the client
            modelBuilder.Entity<Client>()
                .HasOne(client => client.User)
                .WithMany(user => user.Clients)
                .HasForeignKey(client => client.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            // Client's own portal login account
            modelBuilder.Entity<Client>()
                .HasOne(client => client.PortalUser)
                .WithMany()
                .HasForeignKey(client => client.PortalUserId)
                .OnDelete(DeleteBehavior.NoAction);
            
            modelBuilder.Entity<TaxCase>()
                .Property(taxCase => taxCase.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Document>()
                .HasOne(document => document.UploadedByUser)
                .WithMany(user => user.Documents)
                .HasForeignKey(document => document.UploadedByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<DocumentCategory>().HasData(
                new DocumentCategory
                {
                    Id = 1,
                    Name = "Income"
                },
                new DocumentCategory
                {
                    Id = 2,
                    Name = "Identity"
                },
                new DocumentCategory
                {
                    Id = 3,
                    Name = "Health Insurance"
                },
                new DocumentCategory
                {
                    Id = 4,
                    Name = "Prior Return"
                },
                new DocumentCategory
                {
                    Id = 5,
                    Name = "IRS Notice"
                },
                new DocumentCategory
                {
                    Id = 6,
                    Name = "Other"
                });

            modelBuilder.Entity<DocumentType>().HasData(
                new DocumentType
                {
                    Id = 1,
                    Name = "W-2",
                    DocumentCategoryId = 1
                },
                new DocumentType
                {
                    Id = 2,
                    Name = "1099-NEC",
                    DocumentCategoryId = 1
                },
                new DocumentType
                {
                    Id = 3,
                    Name = "1099-MISC",
                    DocumentCategoryId = 1
                },
                new DocumentType
                {
                    Id = 4,
                    Name = "1099-INT",
                    DocumentCategoryId = 1
                },
                new DocumentType
                {
                    Id = 5,
                    Name = "1099-DIV",
                    DocumentCategoryId = 1
                },
                new DocumentType
                {
                    Id = 6,
                    Name = "Driver's License",
                    DocumentCategoryId = 2
                },
                new DocumentType
                {
                    Id = 7,
                    Name = "Passport",
                    DocumentCategoryId = 2
                },
                new DocumentType
                {
                    Id = 8,
                    Name = "Social Security Card",
                    DocumentCategoryId = 2
                },
                new DocumentType
                {
                    Id = 9,
                    Name = "1095-A",
                    DocumentCategoryId = 3
                },
                new DocumentType
                {
                    Id = 10,
                    Name = "Previous Tax Return",
                    DocumentCategoryId = 4
                },
                new DocumentType
                {
                    Id = 11,
                    Name = "IRS Notice",
                    DocumentCategoryId = 5
                },
                new DocumentType
                {
                    Id = 12,
                    Name = "Other",
                    DocumentCategoryId = 6
                }
                );
        }

        public DbSet<Document> Documents { get; set; }

        public DbSet<DocumentCategory> DocumentCategories { get; set; }

        public DbSet<DocumentType> DocumentTypes { get; set; }

        public DbSet<DocumentRequest> DocumentRequests { get; set; }
    }
}
