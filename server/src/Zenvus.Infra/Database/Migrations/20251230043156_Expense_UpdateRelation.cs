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
            migrationBuilder.Sql(@"
                DROP PROCEDURE IF EXISTS DropDebtInstallmentForeignKey;
                
                CREATE PROCEDURE DropDebtInstallmentForeignKey()
                BEGIN
                    DECLARE v_sql VARCHAR(500);
                    
                    -- Procura por qualquer FK que referencia DebtId -> Debts
                    SELECT CONSTRAINT_NAME INTO v_sql
                    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = 'DebtInstallments'
                    AND COLUMN_NAME = 'DebtId'
                    AND REFERENCED_TABLE_NAME = 'Debts'
                    LIMIT 1;
                    
                    IF v_sql IS NOT NULL THEN
                        SET @drop_sql = CONCAT('ALTER TABLE DebtInstallments DROP FOREIGN KEY `', v_sql, '`');
                        PREPARE stmt FROM @drop_sql;
                        EXECUTE stmt;
                        DEALLOCATE PREPARE stmt;
                    END IF;
                END;
                
                CALL DropDebtInstallmentForeignKey();
                
                DROP PROCEDURE DropDebtInstallmentForeignKey;
            ");



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
