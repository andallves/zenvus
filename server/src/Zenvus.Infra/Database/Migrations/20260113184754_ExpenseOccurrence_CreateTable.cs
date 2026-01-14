using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Zenvus.Infra.Database.Migrations
{
    /// <inheritdoc />
    public partial class ExpenseOccurrence_CreateTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Incomes",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2026, 1, 13, 18, 47, 52, 695, DateTimeKind.Utc).AddTicks(9556),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2026, 1, 13, 3, 33, 53, 59, DateTimeKind.Utc).AddTicks(5468));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Expenses",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2026, 1, 13, 18, 47, 52, 695, DateTimeKind.Utc).AddTicks(9556),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2026, 1, 13, 3, 33, 53, 59, DateTimeKind.Utc).AddTicks(5468));

            migrationBuilder.CreateTable(
                name: "ExpenseOccurrences",
                schema: "Zenvus",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    ExpenseId = table.Column<Guid>(type: "char(36)", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ReferenceDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AmountPaid = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Disabled = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExpenseOccurrences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExpenseOccurrences_Expenses_ExpenseId",
                        column: x => x.ExpenseId,
                        principalSchema: "Zenvus",
                        principalTable: "Expenses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_0900_ai_ci");

            migrationBuilder.CreateIndex(
                name: "IX_ExpenseOccurrences_ExpenseId_ReferenceDate",
                schema: "Zenvus",
                table: "ExpenseOccurrences",
                columns: new[] { "ExpenseId", "ReferenceDate" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExpenseOccurrences",
                schema: "Zenvus");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Incomes",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2026, 1, 13, 3, 33, 53, 59, DateTimeKind.Utc).AddTicks(5468),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2026, 1, 13, 18, 47, 52, 695, DateTimeKind.Utc).AddTicks(9556));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Expenses",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2026, 1, 13, 3, 33, 53, 59, DateTimeKind.Utc).AddTicks(5468),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2026, 1, 13, 18, 47, 52, 695, DateTimeKind.Utc).AddTicks(9556));
        }
    }
}
