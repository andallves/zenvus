using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Zenvus.Infra.Database.Migrations
{
    /// <inheritdoc />
    public partial class Expense_UpdateVersionColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE `Zenvus.Debts` 
                MODIFY COLUMN `Version` int unsigned NOT NULL DEFAULT 0;
                
                -- Se necessário, reset para 0 para corrigir problemas
                UPDATE `Zenvus.Debts` SET `Version` = 0 WHERE `Version` IS NULL;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE `Zenvus.Debts` 
                MODIFY COLUMN `Version` int NOT NULL DEFAULT 0;
            ");
        }
    }
}
