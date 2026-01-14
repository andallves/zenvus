using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Zenvus.Infra.Database.Migrations
{
    /// <inheritdoc />
    public partial class Expense_AddNewColumn : Migration
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
                defaultValue: new DateTime(2026, 1, 13, 3, 33, 53, 59, DateTimeKind.Utc).AddTicks(5468),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2026, 1, 6, 19, 49, 38, 887, DateTimeKind.Utc).AddTicks(3953));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Expenses",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2026, 1, 13, 3, 33, 53, 59, DateTimeKind.Utc).AddTicks(5468),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2026, 1, 6, 19, 49, 38, 887, DateTimeKind.Utc).AddTicks(3953));

            migrationBuilder.AddColumn<decimal>(
                name: "AmountPaid",
                schema: "Zenvus",
                table: "Expenses",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AmountPaid",
                schema: "Zenvus",
                table: "Expenses");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Incomes",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2026, 1, 6, 19, 49, 38, 887, DateTimeKind.Utc).AddTicks(3953),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2026, 1, 13, 3, 33, 53, 59, DateTimeKind.Utc).AddTicks(5468));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Expenses",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2026, 1, 6, 19, 49, 38, 887, DateTimeKind.Utc).AddTicks(3953),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2026, 1, 13, 3, 33, 53, 59, DateTimeKind.Utc).AddTicks(5468));
        }
    }
}
