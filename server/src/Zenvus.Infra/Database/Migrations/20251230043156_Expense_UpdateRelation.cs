using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Zenvus.Infra.Database.Migrations
{
    /// <inheritdoc />
    public partial class Expense_UpdateRelation : Migration
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
                defaultValue: new DateTime(2025, 12, 30, 4, 31, 56, 32, DateTimeKind.Utc).AddTicks(3812),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2025, 12, 20, 15, 9, 32, 663, DateTimeKind.Utc).AddTicks(326));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Expenses",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2025, 12, 30, 4, 31, 56, 32, DateTimeKind.Utc).AddTicks(3812),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2025, 12, 20, 15, 9, 32, 663, DateTimeKind.Utc).AddTicks(326));
            

            migrationBuilder.AddForeignKey(
                name: "FK_DebtInstallments_Debts_DebtId",
                schema: "Zenvus",
                table: "DebtInstallments",
                column: "DebtId",
                principalSchema: "Zenvus",
                principalTable: "Debts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Debts_Expenses_ExpenseId",
                schema: "Zenvus",
                table: "Debts",
                column: "ExpenseId",
                principalSchema: "Zenvus",
                principalTable: "Expenses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DebtInstallments_Debts_DebtId",
                schema: "Zenvus",
                table: "DebtInstallments");

            migrationBuilder.DropForeignKey(
                name: "FK_Debts_Expenses_ExpenseId",
                schema: "Zenvus",
                table: "Debts");
            

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Incomes",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2025, 12, 20, 15, 9, 32, 663, DateTimeKind.Utc).AddTicks(326),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2025, 12, 30, 4, 31, 56, 32, DateTimeKind.Utc).AddTicks(3812));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Expenses",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2025, 12, 20, 15, 9, 32, 663, DateTimeKind.Utc).AddTicks(326),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2025, 12, 30, 4, 31, 56, 32, DateTimeKind.Utc).AddTicks(3812));

            migrationBuilder.AddForeignKey(
                name: "FK_DebtInstallments_Debts_DebtId",
                schema: "Zenvus",
                table: "DebtInstallments",
                column: "DebtId",
                principalSchema: "Zenvus",
                principalTable: "Debts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Debts_Expenses_ExpenseId",
                schema: "Zenvus",
                table: "Debts",
                column: "ExpenseId",
                principalSchema: "Zenvus",
                principalTable: "Expenses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
