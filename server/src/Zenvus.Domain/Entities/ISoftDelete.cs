namespace Zenvus.Domain.Entities;

public interface ISoftDelete
{
    bool Disabled { get; set; }
}