using Zenvus.API.Configurations.Swagger;
using Zenvus.Application.DTO.Expenses;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities;

namespace Zenvus.Application.Queries.Expenses;

public class GetExpensesQuery : BasePagedQuery<Expense, ExpenseDto>
{
    public Guid? CategoryId { get; set; }
    public DateTime? Date { get; set; }
    public string? Description { get; set; }
    [SwaggerParameterExample("Nulo", "")]
    [SwaggerParameterExample("Fixed", "1")]
    [SwaggerParameterExample("Variable", "2")]
    [SwaggerParameterExample("Subscription", "3")]
    [SwaggerParameterExample("Loan", "4")]
    [SwaggerParameterExample("Other", "5")]
    public int? TypeId { get; set; }
    public bool? HasDebt { get; set; }
    
    [SwaggerParameterExample("Id", "Id")] 
    [SwaggerParameterExample("Description", "Description")]
    [SwaggerParameterExample("Category", "Category")]
    [SwaggerParameterExample("Color", "Color")]
    [SwaggerParameterExample("Type", "Type")]
    [SwaggerParameterExample("Disabled", "Disabled")]
    public new string OrderBy { get; set; } = "Id";

    public override void ApplyFilter(ref IQueryable<Expense> query)
    {
        if (CategoryId.HasValue)
        {
            query = query.Where(e => e.Category.Id == CategoryId);
        }
        
        if (Date.HasValue)
        {
            query = query.Where(e => e.Date.Equals(Date));
        }
        
        if (!string.IsNullOrEmpty(Description))
        {
            query = query.Where(e => e.Description.Contains(Description));
        }
        
        if (TypeId.HasValue)
        {
            query = query.Where(e => (int)e.Type == TypeId);
        }
        
        if (HasDebt.HasValue)
        {
            query = query.Where(e => e.HasDebt == HasDebt);
        }
    }

    public override void ApplyOrdering(ref IQueryable<Expense> query)
    {
        if (OrderAsc)
        {
            query = OrderBy.ToLower() switch
            {
                "category" => query.OrderBy(e => e.Category.Name),
                "date" => query.OrderBy(e => e.Date),
                "description" => query.OrderBy(e => e.Description),
                "disabled" => query.OrderBy(e => e.Disabled),
                "isExpense" => query.OrderBy(e => e.Type),
                "hasDebt" => query.OrderBy(e => e.HasDebt),
                "createdAt" => query.OrderBy(e => e.CreatedAt),
                _ => query.OrderBy(x => x.Date)
            };
            return;
        }
        
        query = OrderBy.ToLower() switch
        {
            "category" => query.OrderByDescending(e => e.Category.Name),
            "date" => query.OrderByDescending(e => e.Date),
            "description" => query.OrderByDescending(e => e.Description),
            "disabled" => query.OrderByDescending(e => e.Disabled),
            "isExpense" => query.OrderByDescending(e => e.Type),
            "hasDebt" => query.OrderByDescending(e => e.HasDebt),
            "createdAt" => query.OrderBy(e => e.CreatedAt),
            _ => query.OrderByDescending(e => e.Date)
        };
    }
}
