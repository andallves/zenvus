using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Zenvus.Infra.Migrations
{
    /// <inheritdoc />
    public partial class Transaction_CreateExpensesTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Incomes_Categories_CategoryId",
                schema: "Zenvus",
                table: "Incomes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LoginAttempts",
                schema: "Zenvus",
                table: "LoginAttempts");

            migrationBuilder.RenameTable(
                name: "LoginAttempts",
                schema: "Zenvus",
                newName: "TentativasLogin",
                newSchema: "Zenvus");

            migrationBuilder.AlterColumn<string>(
                name: "Telephone",
                schema: "Zenvus",
                table: "Users",
                type: "varchar(12)",
                maxLength: 12,
                nullable: false,
                defaultValue: "",
                collation: "utf8mb4_0900_ai_ci",
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_0900_ai_ci");

            migrationBuilder.AlterColumn<string>(
                name: "RefreshToken",
                schema: "Zenvus",
                table: "Users",
                type: "LONGTEXT",
                nullable: true,
                collation: "utf8mb4_0900_ai_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_0900_ai_ci");

            migrationBuilder.AlterColumn<string>(
                name: "Photo",
                schema: "Zenvus",
                table: "Users",
                type: "LONGTEXT",
                nullable: true,
                collation: "utf8mb4_0900_ai_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_0900_ai_ci");

            migrationBuilder.AlterColumn<string>(
                name: "Password",
                schema: "Zenvus",
                table: "Users",
                type: "LONGTEXT",
                nullable: false,
                collation: "utf8mb4_0900_ai_ci",
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_0900_ai_ci");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "Zenvus",
                table: "Users",
                type: "varchar(150)",
                maxLength: 150,
                nullable: false,
                collation: "utf8mb4_0900_ai_ci",
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_0900_ai_ci");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                schema: "Zenvus",
                table: "Users",
                type: "varchar(150)",
                maxLength: 150,
                nullable: false,
                collation: "utf8mb4_0900_ai_ci",
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_0900_ai_ci");

            migrationBuilder.AlterColumn<bool>(
                name: "ChangePassword",
                schema: "Zenvus",
                table: "Users",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "tinyint(1)");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "Zenvus",
                table: "Incomes",
                type: "varchar(255)",
                maxLength: 255,
                nullable: false,
                collation: "utf8mb4_0900_ai_ci",
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_0900_ai_ci");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Incomes",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2025, 12, 11, 0, 44, 17, 304, DateTimeKind.Utc).AddTicks(8337),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<decimal>(
                name: "Amount",
                schema: "Zenvus",
                table: "Incomes",
                type: "decimal(10,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(65,30)");

            migrationBuilder.AlterColumn<int>(
                name: "Type",
                schema: "Zenvus",
                table: "Categories",
                type: "int",
                nullable: false,
                defaultValue: 2,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TentativasLogin",
                schema: "Zenvus",
                table: "TentativasLogin",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Expenses",
                schema: "Zenvus",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime(6)", nullable: false, defaultValue: new DateTime(2025, 12, 11, 0, 44, 17, 304, DateTimeKind.Utc).AddTicks(8337)),
                    Description = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false, collation: "utf8mb4_0900_ai_ci")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsExpense = table.Column<int>(type: "int", nullable: false),
                    IsDebt = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    DebtId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Disabled = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Expenses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Expenses_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalSchema: "Zenvus",
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_0900_ai_ci");

            migrationBuilder.CreateTable(
                name: "Debts",
                schema: "Zenvus",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ExpenseId = table.Column<int>(type: "int", nullable: false),
                    IsInstallment = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    TotalInstallments = table.Column<int>(type: "int", nullable: true),
                    InstallmentAmount = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    FirstDueDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Disabled = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Debts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Debts_Expenses_ExpenseId",
                        column: x => x.ExpenseId,
                        principalSchema: "Zenvus",
                        principalTable: "Expenses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_0900_ai_ci");

            migrationBuilder.CreateTable(
                name: "DebtInstallments",
                schema: "Zenvus",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    DebtId = table.Column<int>(type: "int", nullable: false),
                    DebtId1 = table.Column<int>(type: "int", nullable: false),
                    Number = table.Column<int>(type: "int", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    IsPaid = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Disabled = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DebtInstallments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DebtInstallments_Debts_DebtId",
                        column: x => x.DebtId,
                        principalSchema: "Zenvus",
                        principalTable: "Debts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DebtInstallments_Debts_DebtId1",
                        column: x => x.DebtId1,
                        principalSchema: "Zenvus",
                        principalTable: "Debts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_0900_ai_ci");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                schema: "Zenvus",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DebtInstallments_DebtId",
                schema: "Zenvus",
                table: "DebtInstallments",
                column: "DebtId");

            migrationBuilder.CreateIndex(
                name: "IX_DebtInstallments_DebtId1",
                schema: "Zenvus",
                table: "DebtInstallments",
                column: "DebtId1");

            migrationBuilder.CreateIndex(
                name: "IX_Debts_ExpenseId",
                schema: "Zenvus",
                table: "Debts",
                column: "ExpenseId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_CategoryId",
                schema: "Zenvus",
                table: "Expenses",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Incomes_Categories_CategoryId",
                schema: "Zenvus",
                table: "Incomes",
                column: "CategoryId",
                principalSchema: "Zenvus",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Incomes_Categories_CategoryId",
                schema: "Zenvus",
                table: "Incomes");

            migrationBuilder.DropTable(
                name: "DebtInstallments",
                schema: "Zenvus");

            migrationBuilder.DropTable(
                name: "Debts",
                schema: "Zenvus");

            migrationBuilder.DropTable(
                name: "Expenses",
                schema: "Zenvus");

            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                schema: "Zenvus",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TentativasLogin",
                schema: "Zenvus",
                table: "TentativasLogin");

            migrationBuilder.RenameTable(
                name: "TentativasLogin",
                schema: "Zenvus",
                newName: "LoginAttempts",
                newSchema: "Zenvus");

            migrationBuilder.AlterColumn<string>(
                name: "Telephone",
                schema: "Zenvus",
                table: "Users",
                type: "longtext",
                nullable: false,
                collation: "utf8mb4_0900_ai_ci",
                oldClrType: typeof(string),
                oldType: "varchar(12)",
                oldMaxLength: 12,
                oldDefaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_0900_ai_ci");

            migrationBuilder.AlterColumn<string>(
                name: "RefreshToken",
                schema: "Zenvus",
                table: "Users",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_0900_ai_ci",
                oldClrType: typeof(string),
                oldType: "LONGTEXT",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_0900_ai_ci");

            migrationBuilder.AlterColumn<string>(
                name: "Photo",
                schema: "Zenvus",
                table: "Users",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_0900_ai_ci",
                oldClrType: typeof(string),
                oldType: "LONGTEXT",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_0900_ai_ci");

            migrationBuilder.AlterColumn<string>(
                name: "Password",
                schema: "Zenvus",
                table: "Users",
                type: "longtext",
                nullable: false,
                collation: "utf8mb4_0900_ai_ci",
                oldClrType: typeof(string),
                oldType: "LONGTEXT")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_0900_ai_ci");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "Zenvus",
                table: "Users",
                type: "longtext",
                nullable: false,
                collation: "utf8mb4_0900_ai_ci",
                oldClrType: typeof(string),
                oldType: "varchar(150)",
                oldMaxLength: 150)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_0900_ai_ci");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                schema: "Zenvus",
                table: "Users",
                type: "longtext",
                nullable: false,
                collation: "utf8mb4_0900_ai_ci",
                oldClrType: typeof(string),
                oldType: "varchar(150)",
                oldMaxLength: 150)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_0900_ai_ci");

            migrationBuilder.AlterColumn<bool>(
                name: "ChangePassword",
                schema: "Zenvus",
                table: "Users",
                type: "tinyint(1)",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "tinyint(1)",
                oldDefaultValue: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "Zenvus",
                table: "Incomes",
                type: "longtext",
                nullable: false,
                collation: "utf8mb4_0900_ai_ci",
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldMaxLength: 255)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_0900_ai_ci");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "Zenvus",
                table: "Incomes",
                type: "datetime(6)",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2025, 12, 11, 0, 44, 17, 304, DateTimeKind.Utc).AddTicks(8337));

            migrationBuilder.AlterColumn<decimal>(
                name: "Amount",
                schema: "Zenvus",
                table: "Incomes",
                type: "decimal(65,30)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,2)");

            migrationBuilder.AlterColumn<int>(
                name: "Type",
                schema: "Zenvus",
                table: "Categories",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldDefaultValue: 2);

            migrationBuilder.AddPrimaryKey(
                name: "PK_LoginAttempts",
                schema: "Zenvus",
                table: "LoginAttempts",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Incomes_Categories_CategoryId",
                schema: "Zenvus",
                table: "Incomes",
                column: "CategoryId",
                principalSchema: "Zenvus",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
