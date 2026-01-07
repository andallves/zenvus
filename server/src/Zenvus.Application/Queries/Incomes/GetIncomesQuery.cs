using System.ComponentModel;
using Zenvus.API.Configurations.Swagger;
using Zenvus.Application.DTO.Incomes;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities;

namespace Zenvus.Application.Queries.Incomes;

public class GetIncomesQuery : BasePagedQuery<Income, IncomeDto>
{
    public string? Description { get; set; }
    [Description("ID da Categoria")]
    public Guid? CategoryId { get; set; }

    [SwaggerParameterExample("Nulo", "")]
    [SwaggerParameterExample("Janeiro", "1")]
    [SwaggerParameterExample("Fevereiro", "2")]
    [SwaggerParameterExample("Março", "3")]
    [SwaggerParameterExample("Abril", "4")]
    [SwaggerParameterExample("Maio", "5")]
    [SwaggerParameterExample("Junho", "6")]
    [SwaggerParameterExample("Julho", "7")]
    [SwaggerParameterExample("Agosto", "8")]
    [SwaggerParameterExample("Setembro", "9")]
    [SwaggerParameterExample("Outubro", "10")]
    [SwaggerParameterExample("Novembro", "11")]
    [SwaggerParameterExample("Dezembro", "12")]
    public int? Month { get; set; }

    public int? Year { get; set; }
    
    [SwaggerParameterExample("Nulo", "")]
    [SwaggerParameterExample("Salario", "1")]
    [SwaggerParameterExample("Bônus", "2")]
    [SwaggerParameterExample("Presente", "3")]
    [SwaggerParameterExample("Other", "4")]
    public int? Type { get; set; }
    public bool? Disabled { get; set; }
    
    [SwaggerParameterExample("Id", "Id")] 
    [SwaggerParameterExample("Description", "Description")]
    [SwaggerParameterExample("Category", "Category")]
    [SwaggerParameterExample("Date", "Date")]
    [SwaggerParameterExample("Type", "Type")]
    [SwaggerParameterExample("Disabled", "Disabled")]
    public new string OrderBy { get; set; } = "Id";
    
    public override void ApplyFilter(ref IQueryable<Income> query)
    {
        if (CategoryId.HasValue)
        {
            query = query.Where(e => e.Category.Id == CategoryId);
        }
        
        if (Month.HasValue)
        {
            query = query.Where(e => e.Date.Month.Equals(Month));
        }
        
        if (Year.HasValue)
        {
            query = query.Where(e => e.Date.Year.Equals(Year));
        }
        
        if (!string.IsNullOrEmpty(Description))
        {
            query = query.Where(e => e.Description.Contains(Description));
        }

        if (Disabled.HasValue)
        {
            query = query.Where(e => e.Disabled == Disabled);
        }
        
        if (Type.HasValue)
        {
            query = query.Where(e => (int)e.Type == Type);
        }
    }

    public override void ApplyOrdering(ref IQueryable<Income> query)
    {
        if (OrderAsc)
        {
            query = OrderBy.ToLower() switch
            {
                "category" => query.OrderBy(e => e.Category.Name),
                "date" => query.OrderBy(e => e.Date),
                "description" => query.OrderBy(e => e.Description),
                "disabled" => query.OrderBy(e => e.Disabled),
                "type" => query.OrderBy(e => e.Type),
                "createdAt" => query.OrderBy(e => e.CreatedAt),
                _ => query.OrderBy(x => x.Id)
            };
            return;
        }
        
        query = OrderBy.ToLower() switch
        {
            "category" => query.OrderByDescending(e => e.Category.Name),
            "date" => query.OrderByDescending(e => e.Date),
            "description" => query.OrderByDescending(e => e.Description),
            "disabled" => query.OrderByDescending(e => e.Disabled),
            "type" => query.OrderByDescending(e => e.Type),
            "createdAt" => query.OrderBy(e => e.CreatedAt),
            _ => query.OrderByDescending(e => e.Id)
        };
    }
}