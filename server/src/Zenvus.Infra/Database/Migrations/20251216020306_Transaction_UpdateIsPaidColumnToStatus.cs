using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Zenvus.Infra.Database.Migrations
{
    /// <inheritdoc />
    public partial class Transaction_UpdateIsPaidColumnToStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPaid",
                schema: "Zenvus",
                table: "DebtInstallments");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Incomes",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2025, 12, 16, 2, 3, 4, 705, DateTimeKind.Utc).AddTicks(1000),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2025, 12, 15, 13, 22, 13, 937, DateTimeKind.Utc).AddTicks(8596));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Expenses",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2025, 12, 16, 2, 3, 4, 705, DateTimeKind.Utc).AddTicks(1000),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2025, 12, 15, 13, 22, 13, 937, DateTimeKind.Utc).AddTicks(8596));

            migrationBuilder.AddColumn<int>(
                name: "Status",
                schema: "Zenvus",
                table: "DebtInstallments",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                schema: "Zenvus",
                table: "DebtInstallments");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Incomes",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2025, 12, 15, 13, 22, 13, 937, DateTimeKind.Utc).AddTicks(8596),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2025, 12, 16, 2, 3, 4, 705, DateTimeKind.Utc).AddTicks(1000));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Expenses",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2025, 12, 15, 13, 22, 13, 937, DateTimeKind.Utc).AddTicks(8596),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2025, 12, 16, 2, 3, 4, 705, DateTimeKind.Utc).AddTicks(1000));

            migrationBuilder.AddColumn<bool>(
                name: "IsPaid",
                schema: "Zenvus",
                table: "DebtInstallments",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }
    }
}
