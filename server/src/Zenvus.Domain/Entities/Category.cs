using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Domain.Entities;

public class Category : SoftDeleteEntity
{
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public IsCategory Type { get; set; }
    public void Enable() => Disabled = false;
    public void Disable() => Disabled = true;
}