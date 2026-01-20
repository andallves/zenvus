namespace Zenvus.Domain.Entities;

public class Entity : ITracking
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public abstract class SoftDeleteEntity : Entity, ISoftDelete
{
    public bool Disabled { get; set; }
}
