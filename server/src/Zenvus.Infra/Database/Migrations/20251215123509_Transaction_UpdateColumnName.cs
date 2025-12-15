using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Zenvus.Infra.Migrations
{
    /// <inheritdoc />
    public partial class Transaction_UpdateColumnName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DebtId",
                schema: "Zenvus",
                table: "Expenses");

            migrationBuilder.DropColumn(
                name: "IsDebt",
                schema: "Zenvus",
                table: "Expenses");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Incomes",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2025, 12, 15, 12, 35, 8, 836, DateTimeKind.Utc).AddTicks(7647),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2025, 12, 11, 1, 39, 49, 180, DateTimeKind.Utc).AddTicks(1004));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Expenses",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2025, 12, 15, 12, 35, 8, 836, DateTimeKind.Utc).AddTicks(7647),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2025, 12, 11, 1, 39, 49, 180, DateTimeKind.Utc).AddTicks(1004));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Incomes",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2025, 12, 11, 1, 39, 49, 180, DateTimeKind.Utc).AddTicks(1004),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2025, 12, 15, 12, 35, 8, 836, DateTimeKind.Utc).AddTicks(7647));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Expenses",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2025, 12, 11, 1, 39, 49, 180, DateTimeKind.Utc).AddTicks(1004),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2025, 12, 15, 12, 35, 8, 836, DateTimeKind.Utc).AddTicks(7647));

            migrationBuilder.AddColumn<int>(
                name: "DebtId",
                schema: "Zenvus",
                table: "Expenses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDebt",
                schema: "Zenvus",
                table: "Expenses",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }
    }
}
