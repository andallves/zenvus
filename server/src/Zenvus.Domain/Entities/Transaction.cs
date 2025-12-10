namespace Zenvus.Domain.Entities;

public abstract class Transaction : SoftDeleteEntity
{
    public new Guid Id { get; set; } = Guid.Empty;
    public int UserId { get; set; }
    
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    
    public void Enable() => Disabled = false;
    public void Disable() => Disabled = true;
}