using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JwtAuth.Migrations
{
    /// <inheritdoc />
    public partial class MakePortalUserUnique : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Clients_PortalUserId",
                table: "Clients");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_PortalUserId",
                table: "Clients",
                column: "PortalUserId",
                unique: true,
                filter: "[PortalUserId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Clients_PortalUserId",
                table: "Clients");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_PortalUserId",
                table: "Clients",
                column: "PortalUserId");
        }
    }
}
