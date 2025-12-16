using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Zenvus.Infra.Migrations
{
    /// <inheritdoc />
    public partial class Transaction_ResolveColumnError : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DebtInstallments_Debts_DebtId",
                schema: "Zenvus",
                table: "DebtInstallments");

            migrationBuilder.DropForeignKey(
                name: "FK_DebtInstallments_Debts_DebtId1",
                schema: "Zenvus",
                table: "DebtInstallments");

            migrationBuilder.DropForeignKey(
                name: "FK_Debts_Expenses_ExpenseId",
                schema: "Zenvus",
                table: "Debts");

            migrationBuilder.DropIndex(
                name: "IX_DebtInstallments_DebtId1",
                schema: "Zenvus",
                table: "DebtInstallments");

            migrationBuilder.DropColumn(
                name: "DebtId1",
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
                oldDefaultValue: new DateTime(2025, 12, 15, 12, 35, 8, 836, DateTimeKind.Utc).AddTicks(7647));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Expenses",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2025, 12, 15, 13, 22, 13, 937, DateTimeKind.Utc).AddTicks(8596),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2025, 12, 15, 12, 35, 8, 836, DateTimeKind.Utc).AddTicks(7647));

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
                defaultValue: new DateTime(2025, 12, 15, 12, 35, 8, 836, DateTimeKind.Utc).AddTicks(7647),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2025, 12, 15, 13, 22, 13, 937, DateTimeKind.Utc).AddTicks(8596));

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Expenses",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2025, 12, 15, 12, 35, 8, 836, DateTimeKind.Utc).AddTicks(7647),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2025, 12, 15, 13, 22, 13, 937, DateTimeKind.Utc).AddTicks(8596));

            migrationBuilder.AddColumn<Guid>(
                name: "DebtId1",
                schema: "Zenvus",
                table: "DebtInstallments",
                type: "char(36)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_DebtInstallments_DebtId1",
                schema: "Zenvus",
                table: "DebtInstallments",
                column: "DebtId1");

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
                name: "FK_DebtInstallments_Debts_DebtId1",
                schema: "Zenvus",
                table: "DebtInstallments",
                column: "DebtId1",
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
    }
}
