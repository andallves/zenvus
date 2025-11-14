namespace Zenvus.Domain.Entities;

public class Category : SoftDeleteEntity
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}