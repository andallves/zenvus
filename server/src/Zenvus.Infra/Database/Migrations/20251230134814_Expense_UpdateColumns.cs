using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Zenvus.Infra.Database.Migrations
{
    /// <inheritdoc />
    public partial class Expense_UpdateColumns : Migration
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
                defaultValue: new DateTime(2025, 12, 30, 13, 48, 13, 610, DateTimeKind.Utc).AddTicks(5475),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2025, 12, 30, 4, 31, 56, 32, DateTimeKind.Utc).AddTicks(3812));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Expenses",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2025, 12, 30, 13, 48, 13, 610, DateTimeKind.Utc).AddTicks(5475),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2025, 12, 30, 4, 31, 56, 32, DateTimeKind.Utc).AddTicks(3812));

            migrationBuilder.AddColumn<decimal>(
                name: "AmountPaid",
                schema: "Zenvus",
                table: "DebtInstallments",
                type: "decimal(65,30)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AmountPaid",
                schema: "Zenvus",
                table: "DebtInstallments");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Incomes",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2025, 12, 30, 4, 31, 56, 32, DateTimeKind.Utc).AddTicks(3812),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2025, 12, 30, 13, 48, 13, 610, DateTimeKind.Utc).AddTicks(5475));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Expenses",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2025, 12, 30, 4, 31, 56, 32, DateTimeKind.Utc).AddTicks(3812),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2025, 12, 30, 13, 48, 13, 610, DateTimeKind.Utc).AddTicks(5475));
        }
    }
}
